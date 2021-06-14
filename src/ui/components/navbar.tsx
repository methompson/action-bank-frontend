import { Component } from "react";
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { selectors, actions } from 'store';
import { StoreType } from "store/store";

type MenuState = {
  menuOpen: boolean,
};

class Navbar extends Component<Record<string, unknown>, MenuState> {
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = {
      menuOpen: false,
    };
  }

  toggleMenu = () => {
    const currentToggle = this.state.menuOpen;

    this.setState({
      menuOpen: !currentToggle,
    });
  };

  closeMenu = () => {
    this.setState({
      menuOpen: false,
    });
  };

  _logOut = () => {
    const logOut = this.props.logOut;

    if (typeof logOut !== 'function') {
      console.log('Invalid Dispatch');
      return;
    }

    this.closeMenu();

    logOut();
  };

  render() {
    const loggedIn = this.props.loggedIn;
    const logInOutButton = loggedIn
      ? <Link to='/' className="button is-danger" onClick={this._logOut}>Log Out</Link>
      : <Link to='/login' className="button is-primary" onClick={this.closeMenu} >Log In</Link>;

    const debug = loggedIn
      ? <Link to='/debug' className='navbar-item' onClick={this.closeMenu} >Debug</Link>
      : null;

    const active = this.state.menuOpen ? 'is-active' : '';

    const exchangeLink = loggedIn
      ? <Link to='/exchanges' className='navbar-item' onClick={this.closeMenu}>Exchanges</Link>
      : null;

    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <button onClick={this.toggleMenu} className={`button is-white navbar-burger ${active}`} aria-label="menu" aria-expanded="false" data-target="navbarContent">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <div className={`navbar-menu ${active}`} id="navbarContent">

          <div className='navbar-start' >
            <Link to='/' className='navbar-item' onClick={this.closeMenu}>Welcome</Link>
            <Link to='/test' className='navbar-item' onClick={this.closeMenu}>Test</Link>
            <Link to='/guard' className='navbar-item' onClick={this.closeMenu}>Guard</Link>
            {exchangeLink}
            {debug}
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              {logInOutButton}
            </div>
          </div>

        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state: StoreType) => {
  return {
    loggedIn: selectors.isLoggedIn(state),
  };
};

const mapDispatchToProps = {
  logOut: actions.logOut,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
