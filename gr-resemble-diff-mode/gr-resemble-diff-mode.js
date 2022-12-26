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
import {htmlTemplate} from './gr-resemble-diff-mode_html.js';

const DEFAULT_SETTING = {
  errorType: 'flat',
  largeImageThreshold: 1200,
};

class ResembleDiffMode extends Polymer.Element {
  static get is() {
    return 'gr-resemble-diff-mode';
  }

  static get template() {
    return htmlTemplate;
  }

  static get properties() {
    return {
      baseImage: Object,
      revisionImage: Object,
      _colorValue: {
        type: String,
        observer: '_handleColorChange',
        value: '#ff0000',
      },
      _difference: {
        type: Number,
        value: 0,
      },
      _ignoreColors: {
        type: Boolean,
        value: false,
      },
      _transparent: {
        type: Boolean,
        value: false,
      },
      loading: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
    };
  }

  static get observers() {
    return ['_handleImageDiff(baseImage, revisionImage)'];
  }

  connectedCallback() {
    super.connectedCallback();
    window.resemble.outputSettings(DEFAULT_SETTING);
  }

  _handleImageDiff(baseImage, revisionImage) {
    if ([baseImage, revisionImage].includes(undefined)) {
      return;
    }
    this.reload();
  }

  _setImageDiffSrc(src) {
    this.$.imageDiff.removeAttribute('src');
    this.$.imageDiff.setAttribute('src', src);
  }

  _setDifferenceValue(percentage) {
    this._difference = percentage;
  }

  _getDataUrl(image) {
    return 'data:' + image['type'] + ';base64,' + image['body'];
  }

  _maybeIgnoreColors(diffProcess, ignoreColors) {
    ignoreColors ? diffProcess.ignoreColors() : diffProcess.ignoreNothing();
    return diffProcess;
  }

  _createDiffProcess(base, rev, ignoreColors) {
    window.resemble.outputSettings(this._setOutputSetting());
    const process = window.resemble(base).compareTo(rev);
    return this._maybeIgnoreColors(process, ignoreColors);
  }

  _setOutputSetting() {
    const rgb = this._hexToRGB(this._colorValue);
    return {
      transparency: this._transparent ? 0.1 : 1,
      errorColor: {
        red: rgb.r,
        green: rgb.g,
        blue: rgb.b,
      },
    };
  }

  /**
   * Reloads the diff. Resemble 1.2.1 seems to have an issue with successive
   * reloads via the repaint() function, so this implementation creates a
   * fresh diff each time it is called.
   *
   * @return {Promise} resolves if and when the reload succeeds.
   */
  reload() {
    this.loading = true;
    if (this.baseImage && this.revisionImage) {
      const base = this._getDataUrl(this.baseImage);
      const rev = this._getDataUrl(this.revisionImage);

      return new Promise((resolve, reject) => {
        this._createDiffProcess(base, rev, this._ignoreColors).onComplete(
            data => {
              this._setImageDiffSrc(data.getImageDataUrl());
              this._setDifferenceValue(data.misMatchPercentage);
              this.loading = false;
              resolve();
            }
        );
      });
    }
    this.loading = false;
  }

  _handleIgnoreColorsToggle() {
    this._ignoreColors = !this._ignoreColors;
    this.reload();
  }

  _handleTransparentToggle() {
    this._transparent = !this._transparent;
    this.reload();
  }

  _handleColorChange() {
    this.reload();
  }

  _hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  }

  _handleFullScreen() {
    const w = window.open('about:blank', '_blank');
    w.document.body.appendChild(this.$.imageDiff.cloneNode(true));
  }
}

customElements.define(ResembleDiffMode.is, ResembleDiffMode);
