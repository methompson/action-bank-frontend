import { ChangeEvent, Component } from "react";
import { connect } from 'react-redux';
import { Redirect } from "react-router";

import { actions, selectors } from 'store';
import { StoreType } from "store/store";

interface LoginState {
  username: string,
  password: string,
}

class LoginClass extends Component<Record<string, unknown>, LoginState> {
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }

  logUserIn = async () => {
    const logIn = this.props.logIn;

    if (typeof logIn !== 'function') {
      console.log('Invalid Dispatch');
      return;
    }

    console.log(`Fields: ${this.state.username}, ${this.state.password}`);

    try {
      await logIn({
        username: this.state.username,
        password: this.state.password,
      });

      console.log('Logged In');
    } catch(e) {
      console.log('error logging in');
    }
  };

  changeUsername = (ev: ChangeEvent<HTMLInputElement>) => this.setState({username: ev.target.value});
  changePassword = (ev: ChangeEvent<HTMLInputElement>) => this.setState({password: ev.target.value});

  render() {
    if (this.props.loggedIn) {
      return (<Redirect to='/' />);
    }

    return (
      <div className='login container'>
        <div className='columns is-mobile is-centered'>
          <div className='column is-half-tablet is-two-thirds-mobile'>

            <div className='login box'>

              <div className='field'>
                <label className='label is-medium'>Username</label>
                <input
                  value={this.state.username}
                  onChange={this.changeUsername}
                  className='input is-medium'
                  type='text' />
              </div>

              <div className='field'>
                <label className='label is-medium'>Password</label>
                <input
                  value={this.state.password}
                  onChange={this.changePassword}
                  className='input is-medium'
                  type='password' />
              </div>

              <div>
                <button onClick={this.logUserIn} className="button is-primary">Sign in</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreType) => {
  return {
    loggedIn: selectors.isLoggedIn(state),
  };
};

const mapDispatchToProps = {
  logIn: actions.logIn,
};

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(LoginClass);

export default function Login() {
  return (
    <ConnectedLogin />
  );
};