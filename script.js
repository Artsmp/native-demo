import Toast from './toast.js';

document.querySelector('button').addEventListener('click', () => {
  console.log(
    new Toast({
      position: Math.random() > 0.5 ? 'top-right' : 'top-center',
      text: 'hello world',
      autoClose: 5000,
    })
  );
});
