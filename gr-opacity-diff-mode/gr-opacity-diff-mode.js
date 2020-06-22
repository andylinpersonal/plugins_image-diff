/**
 * @license
 * Copyright (C) 2018 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {htmlTemplate} from './gr-opacity-diff-mode_html.js';

class OpacityDiffMode extends Polymer.Element {
  static get is() {
    return 'gr-opacity-diff-mode';
  }

  static get template() {
    return htmlTemplate;
  }

  static get properties() {
    return {
      baseImage: Object,
      revisionImage: Object,
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
    this.updateStyles({'--my-opacity-value': this.$.opacitySlider.value});
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
    this.updateStyles({'--div-height': `${height}px`});
  }

  _handleWidthChange(width) {
    if (!width) {
      return;
    }
    this.updateStyles({'--div-width': `${width}px`});
  }
}

customElements.define(OpacityDiffMode.is, OpacityDiffMode);
