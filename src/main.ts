interface mosaic {
  size: number,
  x: number,
  y: number,
  color: string,
}

const $imageInput = document.querySelector<HTMLInputElement>('#image-input');
const $sizeInput = document.querySelector<HTMLInputElement>('#size-input');
const $main = document.querySelector<HTMLDivElement>('#main');
const $pointer = document.querySelector<HTMLSpanElement>('.pointer');
const $canvas = document.createElement('canvas');
const $image = new Image();
const mosaics: mosaic[] = [];

let mosaicSize = 50;
let x = 0;
let y = 0;

$canvas.draggable = false;

if ($pointer) {
  $pointer.classList.add('hidden');
  $pointer.style.width = mosaicSize + 'px';
  $pointer.style.height = mosaicSize + 'px';
}

function getAverageRGB(imgEl : HTMLImageElement, x: number, y: number) : string {
  const blockSize = 1;
  const $canvas = document.createElement('canvas');
  const context = $canvas.getContext && $canvas.getContext('2d');
  const rgb = { r: 0, g: 0, b: 0 };
  let i = -4;
  let count = 0;
  let data = null;

  if (!context) {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  const height = $canvas.height = mosaicSize;
  const width = $canvas.width = mosaicSize;
  const rate = imgEl.naturalWidth / imgEl.offsetWidth;

  context.fillStyle = 'white';
  context.fillRect(0, 0, mosaicSize, mosaicSize);
  context.drawImage(imgEl, x * rate, y * rate, mosaicSize * rate, mosaicSize * rate, 0, 0, mosaicSize, mosaicSize);

  try {
      data = context.getImageData(0, 0, width, height);
  } catch(e) {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  const length = data.data.length;

  while ( (i += blockSize * 4) < length ) {
      count++;
      rgb.r += data.data[i];
      rgb.g += data.data[i + 1];
      rgb.b += data.data[i + 2];
  }

  rgb.r = ~~(rgb.r/count);
  rgb.g = ~~(rgb.g/count);
  rgb.b = ~~(rgb.b/count);

  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function movePointer(x : number, y: number) {
  if (!$pointer) {
    return;
  }

  $pointer.style.left = x - $pointer.offsetWidth / 2 + 'px';
  $pointer.style.top = y - $pointer.offsetHeight / 2 + 'px';
}

function getImageSrc(input : HTMLInputElement) : Promise<string> {
  return new Promise((resolve, reject) => {
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = (ev) => {
        if (ev.target && typeof ev.target.result === 'string') {
          resolve(ev.target.result);
        }

      };

      reader.readAsDataURL(input.files[0]);
    } else {
      reject('The input has no file');
    }
  });
}

$imageInput?.addEventListener('change', async (ev) => {
    const target = ev.target as HTMLInputElement;
    const imgSrc = await getImageSrc(target);

    $image.onload = () => {
      const { offsetWidth, offsetHeight } = $image;

      $canvas.width = offsetWidth;
      $canvas.height = offsetHeight;

      $main?.appendChild($canvas);
    };

    $image.src = imgSrc;

    $main?.appendChild($image);
});

$sizeInput?.addEventListener('change', function () {
  if (this) {
    mosaicSize = Number(this.value);
  }

  if ($pointer) {
    $pointer.style.width = mosaicSize + 'px';
    $pointer.style.height = mosaicSize + 'px';
  }
})

$canvas.addEventListener('mouseenter', () => {
  $pointer?.classList.remove('hidden');
});

$canvas.addEventListener('mousemove', (ev) => {
  x = ev.offsetX;
  y = ev.offsetY;
  movePointer(x, y);
});

$pointer?.addEventListener('mousemove', (ev) => {
  x += ev.offsetX - mosaicSize / 2;
  y += ev.offsetY - mosaicSize / 2;


  if (x < 0 || y < 0) {
    $pointer?.classList.add('hidden');
  }

  movePointer(x, y);
});

$pointer?.addEventListener('click', () => {
  const context = $canvas.getContext('2d');

  if (!context) {
    return;
  }

  const mosaicColor = getAverageRGB($image, x - mosaicSize / 2, y - mosaicSize / 2);
  const mosaicX = x - mosaicSize / 2;
  const mosaicY = y - mosaicSize / 2;

  mosaics.push({ size: mosaicSize, x: mosaicX, y: mosaicY, color: mosaicColor });

  context.fillStyle = mosaicColor;
  context.fillRect(x - mosaicSize / 2, y - mosaicSize / 2, mosaicSize, mosaicSize);
});
