// import { useSelector, useDispatch } from 'react-redux';

// import { selectors } from 'store';

import PageContent from 'ui/pages/page-content';
import Navbar from 'ui/components/navbar';
import Footer from 'ui/components/footer';
import LoadingScreen from 'ui/components/loading-screen';


export default function App() {
  // const dispatch = useDispatch();
  // const loggedIn = useSelector(selectors.isLoggedIn);
  // const notice = loggedIn ? 'Logged In' : 'Not Logged In';

  return (
    <div className='pageContainer'>

      <Navbar />

      <section className="contentSection">
        <LoadingScreen />
        <PageContent />
      </section>

      <Footer />

    </div>
  );
};