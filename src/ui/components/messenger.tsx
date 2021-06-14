import { useDispatch, useSelector } from 'react-redux';
// import { useState, ChangeEvent, useEffect } from 'react';

import { actions, selectors } from 'store';
// import { Exchange, RequestStatusType } from 'store/action-bank/action-bank-types';
import { Message, MessageType } from 'store/messaging/messaging-store-types';

import 'css/messenger.css';

interface MessageCardProps {
  message: Message,
}

function MessageCard(props: MessageCardProps) {
  const dispatch = useDispatch();

  let backgroundColor: string;
  let btnColor: string;

  switch(props.message.messageType) {
    case MessageType.Success:
      backgroundColor = 'has-background-success';
      btnColor = 'is-success';
      break;
    case MessageType.Error:
      backgroundColor = 'has-background-danger';
      btnColor = 'is-danger';
      break;
    default:
      backgroundColor= 'has-background-primary';
      btnColor = 'is-primary';
  }

  const closeMessage = () => {
    dispatch(actions.removeMessage({
      id: props.message.id,
    }));
    console.log('Closing');
  };

  return (
    <div className='messageCard column is-two-thirds'>
      <div className={'box ' + backgroundColor}>
        <div className='messageContent'>
          {props.message.message}
          <button className={'button ' + btnColor} onClick={closeMessage}>
            <span className="icon is-large">
              <i className="fas fa-2x fa-times"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Messenger() {
  const messages = useSelector(selectors.messages);

  const msgComponents = messages.map((message) => {
    return <MessageCard key={message.id} message={message} />;
  });

  return (
    <div className='messengerContainer'>
      <div className='messengerBackdrop'></div>
      <div className='messages columns is-centered is-multiline'>
        {msgComponents}
      </div>
    </div>
  );
}