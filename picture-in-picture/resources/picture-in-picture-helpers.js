if (!('pictureInPictureEnabled' in document)) {
  HTMLVideoElement.prototype.requestPictureInPicture = function() {
    return Promise.reject('Picture-in-Picture API is not available');
  }
}

function callWithTrustedClick(callback) {
  return new Promise((resolve, reject) => {
    let target = document.getElementById('target');
    if (!target) {
      target = document.createElement('button');
      target.setAttribute('id', 'target');
      document.body.appendChild(target);
    }
    test_driver.click(target)
    .then(_ => resolve(callback()))
    .catch(_ => reject('Click failed'));
  });
}

function loadVideo(activeDocument, sourceUrl) {
  return new Promise((resolve, reject) => {
    const document = activeDocument || window.document;
    const video = document.createElement('video');
    video.src = sourceUrl || '/media/movie_5.ogv';
    video.onloadedmetadata = () => {
      resolve(video);
    };
    video.onerror = error => {
      reject(error);
    };
  });
}

// Calls requestPictureInPicture() in a context that's 'allowed to request PiP'.
function requestPictureInPictureWithTrustedClick(videoElement) {
  return callWithTrustedClick(
      () => videoElement.requestPictureInPicture());
}
