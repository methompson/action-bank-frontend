// import {
//   useSelector,
//   useDispatch,
// } from 'react-redux';

// import {
//   actions,
//   selectors,
// } from 'store';

// import Login from 'ui/pages/login';
import Welcome from 'ui/pages/welcome';

const Home = () => {
  console.log('Home');
  // const dispatch = useDispatch();
  // dispatch(actions.saveMessagingData());

  // const loggedIn = useSelector(selectors.isLoggedIn);


  // const Output = loggedIn ? Welcome : Login;

  return (
    // <Output />
    <Welcome />
  );
};



export default Home;