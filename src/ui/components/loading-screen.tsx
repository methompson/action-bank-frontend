import { useSelector } from 'react-redux';

import { selectors } from 'store';

import 'css/loading-screen.css';

function LoadingAnimation() {
  return (
    <div className='loadingAnimationContainer'>
      <div className='loadingAnimationA'></div>
    </div>
  );
}

export default function LoadingScreen() {
  const isLoading = useSelector(selectors.isLoading);
  console.log(isLoading);

  const classes = isLoading ? 'isLoading' : 'isNotLoading click-through';

  return (
    <div className={`${classes} loadingScreenContainer`}>
      <div className='loadingScreenOverlay'></div>
      <div className='loadingScreenContent'>
        <LoadingAnimation />
        Loading
      </div>
    </div>
  );
}