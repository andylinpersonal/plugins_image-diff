// Copyright (C) 2018 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function() {
  'use strict';

  Polymer({
    is: 'gr-resemble-diff-mode',

    properties: {
      baseImage: Object,
      revisionImage: Object,
      _colorValue: {
        type: String,
        observer: '_handleColorChange',
        value: '#00ffff',
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
    },

    observers: [
      '_handleImageDiff(baseImage, revisionImage)',
    ],

    attached() {
      window.resemble.outputSettings({
        errorType: 'movement',
        largeImageThreshold: 0,
        transparency: 1,
      });
    },

    _handleImageDiff() {
      this.reload();
    },

    _setImageDiffSrc(src) {
      delete this.$.imageDiff.src;
      this.$.imageDiff.src = src;
    },

    _getDataUrl(image) {
      return 'data:' + image['type'] + ';base64,' + image['body'];
    },

    _maybeIgnoreColors(diffProcess, ignoreColors) {
      ignoreColors ? diffProcess.ignoreColors() : diffProcess.ignoreNothing();
      return diffProcess;
    },

    _createDiffProcess(base, rev, ignoreColors) {
      const process = window.resemble(base).compareTo(rev);
      return this._maybeIgnoreColors(process, ignoreColors);
    },

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
          this._createDiffProcess(base, rev, this._ignoreColors)
              .onComplete(data => {
                this._setImageDiffSrc(data.getImageDataUrl());
                this.loading = false;
                resolve();
              });
        });
      }
      this.loading = false;
    },

    // The use of debounce is to prevent the user from repeatedly calling the
    // functions in a short amount of time.
    _handleIgnoreColorsToggle() {
      this.debounce('ignore-colors-toggle', () => {
        this._ignoreColors = !this._ignoreColors;
        this.reload();
      }, 1);
    },

    _handleTransparentToggle() {
      this.debounce('transparent-toggle', () => {
        this._transparent = !this._transparent;
        window.resemble.outputSettings({
          transparency: this._transparent ? 0.3 : 1,
        });
        this.reload();
      }, 1);
    },

    // The wait time of 5 ms allows users to see the color change in the image
    // diff relatively close to real time. Any larger wait time will not allow
    // the color to show up immediately on the image diff.
    _handleColorChange() {
      this.debounce('color-change', () => {
        const rgb = this._hexToRGB(this._colorValue);
        window.resemble.outputSettings({
          errorColor: {
            red: rgb.r,
            green: rgb.g,
            blue: rgb.b,
          },
        });
        this.reload();
      }, 5);
    },

    _hexToRGB(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : null;
    },
  });
})();
