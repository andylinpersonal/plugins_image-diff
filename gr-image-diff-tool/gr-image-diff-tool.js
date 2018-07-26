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

  const DiffModes = {
    OPACITY: 'opacity',
    RESEMBLE: 'resemble',
  };

  Polymer({
    is: 'gr-image-diff-tool',

    properties: {
      _showResembleMode: Boolean,
      _showOpacityMode: Boolean,
      _observeMode: {
        type: String,
        observer: '_handleSelect',
      },
    },

    attached() {
      const diff_mode = this._getMode();
      diff_mode === DiffModes.OPACITY ?
          this._displayOpacityMode() : this._displayResembleMode();
    },

    _getMode() {
      return window.localStorage.getItem('image-diff-mode');
    },

    _setMode(mode) {
      window.localStorage.setItem('image-diff-mode', mode);
    },

    _handleSelect(mode) {
      mode === DiffModes.OPACITY ?
          this._displayOpacityMode() : this._displayResembleMode();
    },

    _displayResembleMode() {
      this._observeMode = DiffModes.RESEMBLE;
      this._showResembleMode = true;
      this._showOpacityMode = false;
      this._setMode(DiffModes.RESEMBLE);
    },

    _displayOpacityMode() {
      this._observeMode = DiffModes.OPACITY;
      this._showResembleMode = false;
      this._showOpacityMode = true;
      this._setMode(DiffModes.OPACITY);
    },
  });
})();