(function () {
	'use strict';

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
		height: var(--img-height);
		margin: auto;
		position: absolute;
		width: var(--img-width);
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
<div class="wrapper">
	<div id="imageDiffContainer">
		<img on-load="_onImageLoad" id="imageBase"/>
		<img on-load="_onImageLoad" data-opacity$="{{opacityValue}}" id="imageRevision"/>
	</div>
</div>`;

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
				'_handleHeightChange(_maxHeight)',
				'_handleWidthChange(_maxWidth)',
			];
		}

		_onImageLoad(e) {
			this._maxHeight = Math.max(
				this._maxHeight,
				Polymer.dom(e).rootTarget.naturalHeight
			);
			this._maxWidth = Math.max(
				this._maxWidth,
				Polymer.dom(e).rootTarget.naturalWidth
			);

			this.updateStyles({
				'--img-width': '100%'
			});
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

		handleScaleSizesToggle() {
			let width;
			let height;
			if (this.$.scaleSizesToggle.checked) {
				width = this._maxWidth;
				height = this._maxHeight;
			}

			this.updateStyles({
				'--img-width': width ? width + 'px' : null,
				'--img-height': height ? height + 'px' : null,
			});
		}

		_handleHeightChange(height) {
			if (!height) {
				return;
			}
			this.updateStyles({ '--div-height': `${height}px` });
		}

		_handleWidthChange(width) {
			if (!width) {
				return;
			}
			this.updateStyles({ '--div-width': `${width}px` });
		}
	}

	customElements.define(ImageDiffTool.is, ImageDiffTool);

	Gerrit.install(plugin => {
		plugin.registerCustomComponent('image-diff', 'image-diff-tool');
	});
})();
