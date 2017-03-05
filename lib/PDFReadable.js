'use strict';

const Readable = require('stream').Readable;
/**
 * PDF.js
 * @type {Object}
 */
const pdfjs = require('pdfjs-dist');


//noinspection JSUnusedLocalSymbols
/**
 * PDF text contents as readable stream in object mode
 * @type {PDFReadable}
 */
module.exports = class PDFReadable extends Readable {

  //noinspection JSUnusedGlobalSymbols
  /**
   * PDFReadable Constructor
   * @param src
   * @param opts
   */
  constructor(src, opts = {readable: true, writable: false, objectMode: true}) {
    super(opts);
    this.page = 1;
    this.num_pages = false;
    this.doc = {};
    this.pdf = pdfjs.getDocument(src);
  }



  //noinspection JSUnusedLocalSymbols
  /**
   * Read PDF
   * @param {number} [size]
   * @private
   */
  _read(size) {
    if (!this.num_pages) {
      this._get_doc();
    } else if (this.page <= this.num_pages) {
      this._get_text_content();
    } else {
      this.push(null); // Stream end
    }
  }

  /**
   * Get PDF document Promise and info
   * @private
   */
  _get_doc() {
    this.pdf.then((doc) => {
      this.num_pages = doc.numPages;
      this.doc = doc;
      this.doc.getMetadata()
        .then((metadata) => {
          this.push({
            numPages: this.num_pages,
            metadata: metadata
          });
        });
    });
  }


  /**
   * Get text content
   * @private
   */
  _get_text_content() {
    this.doc.getPage(this.page)
      .then((page) => {
        page.getTextContent()
          .then((content) => {
            this.push({
              page: this.page,
              textContent: content
            });
            ++this.page;
          });
      });
  }
};