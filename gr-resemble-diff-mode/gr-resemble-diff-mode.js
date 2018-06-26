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
      revisonImage: Object,
    },

    observers: [
      '_handleImageDiff(baseImage, revisionImage)',
    ],

    _handleImageDiff(base, revision) {
      if (base && revision) {
        const baseEncoded = this.getDataUrl(base);
        const revisionEncoded = this.getDataUrl(revision);
        return this.compareImages(baseEncoded, revisionEncoded).then(src => {
          this.$.imageDiff.setAttribute('src', src);
        });
      }
    },

    compareImages(baseEncoded, revisionEncoded) {
      return new Promise((resolve, reject) =>
          resemble(baseEncoded).compareTo(revisionEncoded).onComplete(data => {
            if (data.error) {
              reject();
            } else {
              resolve(data.getImageDataUrl());
            }
          })
      );
    },

    getDataUrl(image) {
      return 'data:' + image['type'] + ';base64,' + image['body'];
    },
  });
})();