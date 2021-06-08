// import {
  // useSelector,
  // useDispatch,
// } from 'react-redux';

export default function Guard() {
  const action = () => {
    console.log('Click');
  };

  // const dispatch = useDispatch();

  return (
    <div>
      <button onClick={action}>Test</button>
      <h1>Guard</h1>
    </div>
  );
}
