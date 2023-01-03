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
					cursor: grab;
				}
				#viewport { height: 100%; width: 100%; overflow: visible; cursor: grab; }
				#viewport.manipulating { cursor: grabbing; }
				#transform {
					transform: scale(var(--img-zoom, 1)) translate(var(--img-clientX, 0), var(--img-clientY, 0));
				}
			</style>
			<div id="viewport">
				<div id="transform">
					<slot></slot>
				</div>
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
			self._onDblClick = self._onDblClick.bind(self);
		}

		connectedCallback() {
			super.connectedCallback()
			this._attachEvents();
			this._handleZoom(this.zoom);
		}

		_attachEvents() {
			this.$.viewport.addEventListener("wheel", this._onWheel);
			this.$.viewport.addEventListener("pointerdown", this._onPointerDown);

			// initial offset
			this._translateOffset = [0, 0]
		}

		/** @param {WheelEvent} e */
		_onWheel(e) {
			e.preventDefault();
			// I'm not Mac's user :(
			if (this.zoom >= this.minZoom)
				this.zoom += Math.sign(e.deltaY) * -0.125;
		}

		/** @param {PointerEvent} e */
		_onPointerDown(e) {
			if (!this._isModifierDown(e)) return
			e.preventDefault()
			this.classList.add("manipulating")

			this._lastPointer = [
				e.clientX,
				e.clientY
			]

			this._lastOffset = [...this.translateOffset]

			this.$.viewport.setPointerCapture(e.pointerId)
			this.$.viewport.addEventListener("pointermove", this._onPointerMove)
			this.$.viewport.addEventListener("pointerup", this._onPointerUp)
			this.$.viewport.addEventListener("pointerleave", this._onPointerUp)
			this.$.viewport.addEventListener("dblclick", this._onDblClick)
		}

		/** @param {PointerEvent} e */
		_onPointerMove(e) {
			this.translateOffset = [
				(e.clientX - this._lastPointer[0]) / this._zoom + this._lastOffset[0],
				(e.clientY - this._lastPointer[1]) / this._zoom + this._lastOffset[1]
			]
		}

		/** @param {PointerEvent} e */
		_onPointerUp(e) {
			this.$.viewport.classList.remove("manipulating");
			this.$.viewport.removeEventListener("pointermove", this._onPointerMove)
			this.$.viewport.removeEventListener("pointerup", this._onPointerUp)
			this.$.viewport.removeEventListener("pointerleave", this._onPointerUp)
			this.$.viewport.releasePointerCapture(e.pointerId);
		}

		/**
		 * @description reset offset and zooming
		 * @param {PointerEvent} e */
		_onDblClick(e) {
			this.translateOffset = [0, 0]
			this._handleZoom(1)
		}

		_isModifierDown(e) {
			if (!this.modifierKey) return true;
			if (this.modifierKey === "ctrl" && e.ctrlKey) return true;
			if (this.modifierKey === "alt" && e.altKey) return true;
			if (this.modifierKey === "shift" && e.shiftKey) return true;
			return false;
		}

		_handleZoom(val) {
			this.zoom = this._zoom = Math.min(Math.max(parseFloat(val), this.minZoom), this.maxZoom);
			this.updateStyles({ '--img-zoom': this._zoom });
		}

		set translateOffset(val) {
			this._translateOffset = [val[0], val[1]]
			this.updateStyles({
				'--img-clientX': `${this._translateOffset[0]}px`,
				'--img-clientY': `${this._translateOffset[1]}px`,
			})
		}

		get translateOffset() {
			return this._translateOffset
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
	}
	img {
		display: block;
		margin: auto;
		position: absolute;
		width: 100%;
	}
	#imageRevision {
		opacity: var(--img-opacity);
	}
	#imageDiffContainer {
		height: 30vh;
		overflow-x: visible;
		overflow-y: clip;
		position: relative;
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
			<input id="opacitySlider" max="1.0" min="0.01" on-input="handleOpacityChange" step=".01" type="range" value="0.5"/>
		</label>
	</div>
</div>
<div class="diffmode">
	<template is="dom-if" if="[[_showOnionMode]]" restamp="true">
		<onion-diff-mode base-image="[[baseImage]]" revision-image="[[revisionImage]]"></onion-diff-mode>
	</template>
</div>
<div class="wrapper">
	<image-diff-pan-box zoom="1" min-zoom="0.5" id="imageDiffContainer">
		<img on-load="_onImageLoad" id="imageBase"/>
		<img on-load="_onImageLoad" data-opacity$="{{opacityValue}}" id="imageRevision"/>
	</image-diff-pan-box>
<div>`;

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

		constructor() {
			super();
			this._bind(this);
		}

		/**
		 * @description bind proper `this` to viewport's handlers
		*/
		_bind(self) {
			self._onPointerDown = self._onPointerDown.bind(self);
			self._onPointerMove = self._onPointerMove.bind(self);
			self._onPointerUp = self._onPointerUp.bind(self);
			self._onDblClick = self._onDblClick.bind(self);
		}

		static numActive = 0

		connectedCallback() {
			super.connectedCallback();
			if (!this.baseImage && !this.revisionImage) {
				this.hidden = true;
			}
			this._displayOnionMode();
			const currentZIndex = Number.parseInt(window.getComputedStyle(this).zIndex);
			if (isNaN(currentZIndex)) currentZIndex = 0;
			this.updateStyles({'z-index': currentZIndex + (ImageDiffTool.numActive++) * 10})

			this.$.header.addEventListener("dblclick", this._onDblClick);
			this.$.header.addEventListener("pointerdown", this._onPointerDown);
		}

		/** @param {PointerEvent} e */
		_onPointerDown(e) {
			// ignore event from children
			if (this.$.header !== e.target) return;
			e.preventDefault()
			this.classList.add("manipulating")

			this._lastMouseY = e.clientY
			this._lastHeightPx = window.getComputedStyle(this.$.imageDiffContainer).height

			this.$.header.setPointerCapture(e.pointerId)
			this.$.header.addEventListener("pointermove", this._onPointerMove)
			this.$.header.addEventListener("pointerup", this._onPointerUp)
			this.$.header.addEventListener("pointerleave", this._onPointerUp)
		}

		/** @param {PointerEvent} e */
		_onPointerMove(e) {
			// ignore event from children
			if (this.$.header !== e.target) return;
			let oldHeightVh;
			if (this._lastHeightPx.endsWith('px')) {
				oldHeightVh = Number.parseInt(this._lastHeightPx.replace('px', '')) / document.body.clientHeight * 100
			} else {
				throw new TypeError('invalid height format')
			}

			const newOffsetVh = (e.clientY - this._lastMouseY) / document.body.clientHeight * 100
			const newHeightVh = oldHeightVh - newOffsetVh // bottom up
			this.$.imageDiffContainer.updateStyles({ height: `${newHeightVh}vh` })
		}

		/** @param {PointerEvent} e */
		_onPointerUp(e) {
			// ignore event from children
			if (this.$.header !== e.target) return;
			this.$.header.classList.remove("manipulating");
			this.$.header.removeEventListener("pointermove", this._onPointerMove)
			this.$.header.removeEventListener("pointerup", this._onPointerUp)
			this.$.header.removeEventListener("pointerleave", this._onPointerUp)
			this.$.header.releasePointerCapture(e.pointerId);
		}

		/**
		 * @description reset offset and zooming
		 * @param {PointerEvent} e */
		_onDblClick(e) {
			// ignore event from children
			if (this.$.header !== e.target) return;
			this.setAttribute('hidden', 'true');
			this.parentNode.removeChild(this);
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
			];
		}

		_onImageLoad(e) {
		}

		_handleImageChange(baseImage, revisionImage) {
			if ([baseImage, revisionImage].includes(undefined)) return;
			this.$.imageBase.setAttribute('src', this.computeSrcString(baseImage));
			this.$.imageRevision.setAttribute('src',this.computeSrcString(revisionImage));
			this.handleOpacityChange();
		}

		handleOpacityChange() {
			this.updateStyles({ '--img-opacity': this.$.opacitySlider.value });
		}

		computeSrcString(image) {
			if (image) {
				return 'data:' + image['type'] + ';base64,' + image['body'];
			} else {
				return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
			}
		}
	}

	customElements.define(ImageDiffTool.is, ImageDiffTool);

	Gerrit.install(plugin => {
		plugin.registerCustomComponent('image-diff', 'image-diff-tool');
	});
})();
