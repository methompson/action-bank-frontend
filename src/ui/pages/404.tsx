import { useSelector } from 'react-redux';

import { selectors } from 'store';

export default function FourOhFour() {
  const loggedIn = useSelector(selectors.isLoggedIn);
  console.log(loggedIn);
  return (
    <h1>
      Not Found
    </h1>
  );
}
