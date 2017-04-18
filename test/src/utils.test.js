/* global describe, it */
const fs = require('fs-extra');
const path = require('path');
const sinon = require('sinon');
const helper = require('../helper');
const utils = require('../../src/utils');

const dest = helper.output;
const ext = '.html';
const hostname = 'example.com';
const src = 'http://' + hostname;
const html = '<div>Hello world!</div>';


describe('Utils', () => {

  describe('getPagenameFromUrl', () => {

    const tests = [
      {
        it: 'should succeed with only hostname without final /',
        input: 'http://example.com',
        output: 'example.com'
      },
      {
        it: 'should succeed with only hostname withfinal /',
        input: 'http://example.com/',
        output: 'example.com'
      },
      {
        it: 'should succeed with subdomain and only hostname without final /',
        input: 'http://test.example.com',
        output: 'test.example.com'
      },
      {
        it: 'should succeed with subdomain and only hostname with final /',
        input: 'http://test.example.com/',
        output: 'test.example.com'
      },
      {
        it: 'should succeed with one folder without final /',
        input: 'http://example.com/folder1',
        output: 'folder1'
      },
      {
        it: 'should succeed with one folder with final /',
        input: 'http://example.com/folder1/',
        output: 'folder1'
      },
      {
        it: 'should succeed with two folders without final /',
        input: 'http://example.com/folder1/folder2',
        output: 'folder2'
      },
      {
        it: 'should succeed with two folders with final /',
        input: 'http://example.com/folder1/folder2/',
        output: 'folder2'
      },
      {
        it: 'should succeed with query string without final /',
        input: 'http://example.com?query=string',
        output: 'example.com'
      },
      {
        it: 'should succeed with query string with final /',
        input: 'http://example.com/?query=string',
        output: 'example.com'
      },
    ];

    tests.forEach((item) => {

      it(item.it, (done) => {
        const output = utils.getPagenameFromUrl(item.input);
        output.should.equal(item.output);

        done();
      });

    });
  });


  describe('downloadPage', () => {

    it('should succeed to download a page', (done) => {
      helper.nock(src)
        .get('/')
          .reply(200, html);

      utils.downloadPage(src, dest)
        .then((res) => {
          res.should.equal(hostname + ext);
          fs.readFile(path.join(dest, res), 'utf8', (err, content) => {
            if (err) {
              done(err);
            }

            content.should.equal(html);

            done();
          });
        })
        .catch((err) => done(err));
    });

    it('should succeed to download a page with a given name', (done) => {
      const name = 'index';

      helper.nock(src)
        .get('/')
          .reply(200, html);

      utils.downloadPage(src, dest, name)
        .then((res) => {
          res.should.equal(name + ext);
          fs.readFile(path.join(dest, res), 'utf8', (err, content) => {
            if (err) {
              done(err);
            }

            content.should.equal(html);

            done();
          });
        })
        .catch((err) => done(err));
    });

    it('should fail when the website replies with error', (done) => {
      const error = 'something awful happened';

      helper.nock(src)
        .get('/')
          .replyWithError(error);

      utils.downloadPage(src, dest)
        .then(() => {
          done('There should be an error');
        })
        .catch((err) => {
          err.error.message.should.equal(error);
          err.url.should.equal(src);

          done();
        });
    });

    it('should fail when the website replies not 200', (done) => {
      const error = 400;

      helper.nock(src)
        .get('/')
          .reply(error);

      utils.downloadPage(src, dest)
        .then(() => {
          done('There should be an error');
        })
        .catch((err) => {
          err.error.message.should.equal(error + '');
          err.url.should.equal(src);

          done();
        });
    });

    it('should fail when creating the directory returns an error', (done) => {
      const error = 'fake fs error';

      helper.nock(src)
        .get('/')
          .reply(200, html);

      const revert = sinon.stub(fs, 'mkdirs').callsFake((dest, cb) => {
        return cb(new Error(error));
      });

      utils.downloadPage(src, dest)
        .then(() => {
          revert.restore();

          done('There should be an error');
        })
        .catch((err) => {
          revert.restore();

          err.error.message.should.equal(error);
          err.url.should.equal(src);

          done();
        });
    });

    it('should fail when writing the file returns an error', (done) => {
      const error = 'fake fs error';

      helper.nock(src)
        .get('/')
          .reply(200, html);

      const revert = sinon.stub(fs, 'writeFile').callsFake((dest, body, cb) => {
        return cb(new Error(error));
      });

      utils.downloadPage(src, dest)
        .then(() => {
          revert.restore();

          done('There should be an error');
        })
        .catch((err) => {
          revert.restore();

          err.error.message.should.equal(error);
          err.url.should.equal(src);

          done();
        });
    });

  });


  describe('downloadPages', () => {

    it('should succeed to download a list of pages', (done) => {
      const f1 = 'folder1';
      const srcs = [
        src,
        src + '/' + f1
      ];

      helper.nock(src)
        .get('/')
          .reply(200, html)
        .get('/' + f1)
          .reply(200, html);

      utils.downloadPages(srcs, dest)
        .then((res) => {
          res[0].should.equal(hostname + ext);
          res[1].should.equal(f1 + ext);

          fs.readFile(path.join(dest, res[0]), 'utf8', (err, content) => {
            if (err) {
              done(err);
            }

            content.should.equal(html);

            fs.readFile(path.join(dest, res[1]), 'utf8', (err, content) => {
              if (err) {
                done(err);
              }

              content.should.equal(html);

              done();
            });
          });
        })
        .catch((err) => done(err));
    });

    it('should fail to download a list of pages', (done) => {
      const error = 400;
      const f1 = 'folder1';
      const srcs = [
        src,
        src + '/' + f1
      ];

      helper.nock(src)
        .get('/')
          .reply(200, html)
        .get('/' + f1)
          .reply(error);

      utils.downloadPages(srcs, dest)
        .then(() => {
          done('There should be an error');
        })
        .catch((err) => {
          err.error.message.should.equal(error + '');
          err.url.should.equal(srcs[1]);

          done();
        });
    });

  });


  describe('readFile', () => {

    it('should fail when the file does not exist', (done) => {
      const dest = './xxx';
      const error = 'ENOENT: no such file or directory, open \'' + dest + '\'';

      utils.readFile(dest)
        .then(() => {
          done('There should be an error');
        })
        .catch((err) => {
          err.message.should.equal(error);

          done();
        });
    });

    it('should succeed when the file does exist', (done) => {
      const folder = path.join(dest, 'xxx');
      const content = 'hello';

      fs.mkdirs(dest, (err) => {
        if (err) {
          done(err);
        }

        fs.writeFile(folder, content, (err) => {
          if (err) {
            done(err);
          }

          utils.readFile(folder)
            .then((res) => {
              res.should.equal(content);

              done();
            })
            .catch((err) => done(err));
        });
      });
    });

  });

});