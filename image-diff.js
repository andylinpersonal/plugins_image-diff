(function () {
	'use strict';

	/**
	 * @description https://dev.to/ndesmic/how-to-make-a-pan-and-zoom-control-with-web-components-4ji6
	*/
	class ImageDiffPanBox extends Polymer.Element {
		static get is() {
			return 'image-diff-pan-box';
		}

		static get template() {
			return Polymer.html`
			<style>
				:host {
					display: block;
				}
				#viewport { height: 100%; width: 100%; overflow: auto; cursor: grab; }
				#viewport.manipulating { cursor: grabbing; }
			</style>
			<div id="viewport">
				<slot></slot>
			</div>
			`;
		}

		/** @type {Number} backing field of attribute `zoom` */
		_zoom

		static get properties() {
			return {
				zoom: {
					type: Number,
					value: 1.0,
					readOnly: false,
					notify: true,
					reflectToAttribute: true,
					observer: '_handleZoom'
				},
				minZoom: {
					type: Number,
					value: 0.1,
				},
				maxZoom: {
					type: Number,
					value: Infinity,
				},
				modifierKey: {
					type: String,
					value: null,
					reflectToAttribute: true,
				}
			}
		}

		static get observers() {
			return []
		}

		constructor() {
			super();
			this._bind(this);
		}

		/**
		 * @description bind proper `this` to viewport's handlers
		*/
		_bind(self) {
			self._onWheel = self._onWheel.bind(self);
			self._onPointerDown = self._onPointerDown.bind(self);
			self._onPointerMove = self._onPointerMove.bind(self);
			self._onPointerUp = self._onPointerUp.bind(self);
		}

		connectedCallback() {
			super.connectedCallback()
			this._attachEvents();
			this.$.viewport.style.zoom = this.zoom
		}

		_attachEvents() {
			this.$.viewport.addEventListener("wheel", this._onWheel);
			this.$.viewport.addEventListener("pointerdown", this._onPointerDown);
		}

		_onWheel(e) {
			e.preventDefault();
			this.zoom += e.deltaY / 1000;
		}

		_onPointerDown(e) {
			if (!this._isModifierDown(e)) return
			e.preventDefault()
			this.$.viewport.classList.add("manipulating")
			this._lastPointer = [
				e.offsetX,
				e.offsetY
			]

			this._lastScroll = [
				this.$.viewport.scrollLeft,
				this.$.viewport.scrollTop
			]

			this.$.viewport.setPointerCapture(e.pointerId)
			this.$.viewport.addEventListener("pointermove", this._onPointerMove)
			this.$.viewport.addEventListener("pointerup", this._onPointerUp)
		}
		_onPointerMove(e) {
			const currentPointer = [
				e.offsetX,
				e.offsetY
			];
			const delta = [
				currentPointer[0] + this._lastScroll[0] - this._lastPointer[0],
				currentPointer[1] + this._lastScroll[1] - this._lastPointer[1]
			];

			this.$.viewport.scroll(this._lastScroll[0] / this.zoom - delta[0] / this.zoom, this._lastScroll[1] / this.zoom - delta[1] / this.zoom, { behavior: "instant" });
		}
		_onPointerUp(e) {
			this.$.viewport.classList.remove("manipulating");
			this.$.viewport.removeEventListener("pointermove", this._onPointerMove)
			this.$.viewport.removeEventListener("pointerup", this._onPointerUp)
			this.$.viewport.releasePointerCapture(e.pointerId);
		}
		_isModifierDown(e) {
			if (!this.modifierKey) return true;
			if (this.modifierKey === "ctrl" && e.ctrlKey) return true;
			if (this.modifierKey === "alt" && e.altKey) return true;
			if (this.modifierKey === "shift" && e.shiftKey) return true;
			return false;
		}

		_handleZoom(val) {
			this._zoom = Math.min(Math.max(parseFloat(val), this.minZoom), this.maxZoom);
			this.$.viewport.style.zoom = this._zoom;
		}
	}

	customElements.define(ImageDiffPanBox.is, ImageDiffPanBox);

	const ImageDiffToolHTML = Polymer.html`
<style include="shared-styles">
	:host {
		background-color: var(--table-header-background-color);
		display: block;
		font-family: var(--font-family);
		z-index: 200;
		position: fixed;
		left: 0px;
		right: 0px;
		bottom: 0px;
		border-radius: 5px;
		box-shadow: 0px 0px 25px rgb(0 0 0 / 0.5);
	}
	#header {
		align-items: center;
		border-bottom: 1px solid var(--border-color, #ddd);
		display: inline-flex;
		font-size: var(--font-size-normal);
		padding: .5em;
		justify-content: space-between;
		width: 100%;
	}
	#dropdown {
		background-color: var(--view-background-color);
		border: 1px solid var(--border-color);
		border-radius: 2px;
		color: var(--primary-text-color);
		font-size: var(--font-size-normal);
		height: 2em;
		padding: 0 .5em;
	}
	.wrapper {
		box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
		/*display: block;
		overflow: auto; */
	}
	img {
		display: block;
		margin: auto;
		position: absolute;
		/*height: var(--img-height);
		width: var(--img-width);*/
		width: 100%;
	}
	#imageRevision {
		opacity: var(--img-opacity);
	}
	#imageDiffContainer {
		height: 50vh;
		overflow: auto;
		position: relative;
		width: 80%;
		margin: auto;
	}
	h3 {
		display: inline;
		margin: .5em;
	}
	label {
		align-items: center;
		display: flex;
	}
	input {
		margin: .5em;
		margin-right: 1.5em;
	}
	#opacitySlider {
		width: 10em;
	}
</style>
<div id="header">
	<div id="modesContainer">
		<h3>Visual Diff</h3>
		<select value="{{_observeMode::change}}" id="dropdown">
			<option value="onion" title="Overlay the new image over the old and use an opacity control to view the differences">Onion</option>
		</select>
	</div>
	<div id="controlsContainer">
		<label>
			<h3>Revision Opacity</h3>
			<input id="opacitySlider" max="1.0" min="0.0" on-input="handleOpacityChange" step=".01" type="range" value="0.5"/>
		</label>
	</div>
</div>
<div class="diffmode">
	<template is="dom-if" if="[[_showOnionMode]]" restamp="true">
		<onion-diff-mode base-image="[[baseImage]]" revision-image="[[revisionImage]]"></onion-diff-mode>
	</template>
</div>
<image-diff-pan-box min-zoom="0.5" class="wrapper">
	<div id="imageDiffContainer">
		<img on-load="_onImageLoad" id="imageBase"/>
		<img on-load="_onImageLoad" data-opacity$="{{opacityValue}}" id="imageRevision"/>
	</div>
</image-diff-pan-box>`;

	const DiffModes = {
		ONION: 'onion',
	};

	class ImageDiffTool extends Polymer.Element {
		static get is() {
			return 'image-diff-tool';
		}

		static get template() {
			return ImageDiffToolHTML;
		}

		static get properties() {
			return {
				baseImage: Object,
				revisionImage: Object,
				hidden: {
					type: Boolean,
					value: false,
					reflectToAttribute: true,
				},
				_showOnionMode: Boolean,
				_observeMode: {
					type: String,
					observer: '_handleSelect',
				},
				opacityValue: Number,
				_maxHeight: {
					type: Number,
					value: 0,
				},
				_maxWidth: {
					type: Number,
					value: 0,
				},
			};
		}

		connectedCallback() {
			super.connectedCallback();
			if (!this.baseImage || !this.revisionImage) {
				this.hidden = true;
			}
			this._displayOnionMode();
		}

		_getMode() {
			return window.localStorage.getItem('image-diff-mode');
		}

		_setMode(mode) {
			window.localStorage.setItem('image-diff-mode', mode);
		}

		_handleSelect(mode) {
			this._displayOnionMode();
		}

		_displayOnionMode() {
			this._observeMode = DiffModes.ONION;
			this._showOnionMode = true;
			this._setMode(DiffModes.ONION);
		}

		static get observers() {
			return [
				'_handleImageChange(baseImage, revisionImage)',
				// '_handleHeightChange(_maxHeight)',
				// '_handleWidthChange(_maxWidth)',
			];
		}

		_onImageLoad(e) {
		}

		_handleImageChange(baseImage, revisionImage) {
			if ([baseImage, revisionImage].includes(undefined)) return;
			this.$.imageRevision.setAttribute(
				'src',
				this.computeSrcString(revisionImage)
			);
			this.$.imageBase.setAttribute('src', this.computeSrcString(baseImage));
			this.handleOpacityChange();
		}

		handleOpacityChange() {
			this.updateStyles({ '--img-opacity': this.$.opacitySlider.value });
		}

		computeSrcString(image) {
			return 'data:' + image['type'] + ';base64, ' + image['body'];
		}
	}

	customElements.define(ImageDiffTool.is, ImageDiffTool);

	Gerrit.install(plugin => {
		plugin.registerCustomComponent('image-diff', 'image-diff-tool');
	});
})();
