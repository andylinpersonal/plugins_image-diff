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
      _ignoreColors: {
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
        largeImageThreshold: 450,
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
      if (ignoreColors) {
        diffProcess.ignoreColors();
      } else {
        diffProcess.ignoreNothing();
      }
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

    _handleIgnoreColorsToggle() {
      this._ignoreColors = !this._ignoreColors;
      this.reload();
    },
  });
})();
