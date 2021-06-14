import { FunctionComponent } from 'react';

interface ModalContainerProps {
  close: () => void,
};

const ModalContainer: FunctionComponent<ModalContainerProps> = (props) => {
  return <div className='modal is-active'>
    <div className='modal-background' onClick={props.close}></div>
    <div className='modal-content section'>
      <div className='box'>
        <div>{props.children}</div>
      </div>
    </div>
    <button
      onClick={props.close}
      className="modal-close is-large"
      aria-label="close">
    </button>
  </div>;
};

export default ModalContainer;