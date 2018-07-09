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
    is: 'gr-opacity-diff-mode',

    properties: {
      baseImage: Object,
      revisionImage: Object,
      opacityValue: Number,
    },

    attached() {
      if (this.revisionImage) {
        const srcRevision = this.computeSrcString(this.revisionImage);
        this.$.imageRevision.setAttribute('src', srcRevision);
      }
      if (this.baseImage) {
        const srcBase = this.computeSrcString(this.baseImage);
        this.$.imageBase.setAttribute('src', srcBase);
      }
    },

    handleOpacityChange() {
      this.customStyle['--my-opacity-value'] = this.$.opacitySlider.value;
      this.updateStyles();
    },

    computeSrcString(image) {
      return 'data:' + image['type'] + ';base64, ' + image['body'];
    },
  });
})();