/**
 * @license
 * Copyright (C) 2020 The Android Open Source Project
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

export const htmlTemplate = Polymer.html`
<style include="shared-styles">
  :host {
    background-color: var(--table-header-background-color, #fafafa);
    display: block;
    font-family: var(--font-family);
  }
  /** This is needed as we have explicit display on :host
    * which will override hidden from shared-styles
    */
  :host[hidden] {
    display: none;
  }
  #header {
    align-items: center;
    border-bottom: 1px solid var(--border-color, #ddd);
    border-top: 1px solid var(--border-color, #ddd);
    display: inline-flex;
    padding: .5em;
    width: 100%;
  }
  h3 {
    padding: 0 .5em;
  }
  #dropdown {
    background-color: var(--view-background-color);
    border: 1px solid var(--border-color);
    border-radius: 2px;
    color: var(--primary-text-color);
    font-size: var(--font-size-normal);
    height: 2em;
    margin-left: 1em;
    padding: 0 .15em;
  }
  .diffmode {
    align-items: center;
    display: flex;
    justify-content: center;
  }
</style>
<div id="header">
  <h3>Image diff</h3>
  <select value="{{_observeMode::change}}" id="dropdown">
    <option value="resemble" title="Scale the images to the same size and compute a diff with highlights">Highlight differences</option>
    <option value="opacity" title="Overlay the new image over the old and use an opacity control to view the differences">Onion skin</option>
  </select>
</div>
<div class="diffmode">
  <template is="dom-if" if="[[_showResembleMode]]" restamp="true">
    <gr-resemble-diff-mode
        base-image="[[baseImage]]"
        revision-image="[[revisionImage]]"></gr-resemble-diff-mode>
  </template>
</div>
<div class="diffmode">
  <template is="dom-if" if="[[_showOpacityMode]]" restamp="true">
    <gr-opacity-diff-mode
        base-image="[[baseImage]]"
        revision-image="[[revisionImage]]"></gr-opacity-diff-mode>
  </template>
</div>`;