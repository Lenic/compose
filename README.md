# @lenic/compose

组合模式的一个实现方案，可以把操作封装成一个管道。

## Usage

```html
<div>
  <div>
    <input id="btnWhite" type="button" value="clear" />
    <input id="btnSync" type="button" value="同步测试" />
    <input id="btnAsync" type="button" value="异步测试" />
  </div>
  <div>
    <ol id="olList"></ol>
  </div>
</div>
```

```js
import { compose } from '@lenic/compose';

import seqence from './seqence';

const ol = document.getElementById('olList');

const print = (...args) => {
  const msg = args.join(' -- ');

  const li = document.createElement('li');
  li.innerText = msg;
  ol.appendChild(li);

  console.log(msg);
};

const getPromise = (wait, action) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      action(resolve, reject);
    }, wait);
  });
};

document.getElementById('btnWhite').addEventListener('click', () => {
  ol.innerHTML = null;
});

document.getElementById('btnSync').addEventListener('click', () => {
  const config = compose((options) => options, [
    (next, options) => {
      const res = next(3);
      return res + 1 + options;
    },
    (next, options) => {
      const res = next();
      return res + 2 + options;
    },
    (next, options) => {
      const res = next(5);
      return res + 3 + options;
    },
    (next, options) => {
      const res = next();
      return res + 4 + options;
    }
  ]);

  const result = config.exec(Math.floor(Math.random() * 10));

  print('sync completed', result);
});

document.getElementById('btnAsync').addEventListener('click', () => {
  const seq = seqence(2);

  const config = compose((v) => Promise.resolve(`end(${v})`), [
    seq,
    (next) => {
      return new Promise((r) => {
        setTimeout(() => {
          r(next());
        }, Math.floor(Math.random() * 1000));
      });
    }
  ]);

  config.exec('1').then((v) => print('async completed', v));
  config.exec('2').then((v) => print('async completed', v));
  config.exec('3').then((v) => print('async completed', v));
  config.exec('4').then((v) => print('async completed', v));
  config.exec('5').then((v) => print('async completed', v));
});
```
