import { useState, ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from 'store';
import { Exchange, RequestStatusType } from 'store/action-bank/action-bank-types';

interface addExchangeProps {
  exchange: Exchange,
  closeModal: () => void,
}

let prevActionStatus: RequestStatusType | null;

export default function AddAction(props: addExchangeProps) {
  const dispatch = useDispatch();

  const [actionType, setActionType] = useState('');
  const [actionName, setActionName] = useState('Test');
  const [uom, setUom] = useState('Test');
  const [uomQuant, setUomQuant] = useState(1);
  const [transQuant, setTransQuant] = useState(1);

  const [busy, setBusy] = useState(false);

  const [isActionTypeValid, setIsActionTypeValid] = useState(true);
  const [isActionNameValid, setIsActionNameValid] = useState(true);
  const [isUomValid, setIisUomValid] = useState(true);
  const [isUomQuantValid, setIsUomQuantValid] = useState(true);
  const [isTransQuantValid, setIsTransQuantValid] = useState(true);

  const depositActionStatus = useSelector(selectors.depositActionStatus);
  const withdrawalActionStatus = useSelector(selectors.depositActionStatus);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (actionType === '') return;

    const { status, msg } = actionType === 'deposit'
      ? depositActionStatus
      : withdrawalActionStatus;

    if (prevActionStatus === RequestStatusType.Pending){
      if (status === RequestStatusType.Success) {
        props.closeModal();
        dispatch(actions.addSuccessMessage({
          message: `Added new action: ${actionName}`,
        }));
      }
      else if (status === RequestStatusType.Fail) {
        setBusy(false);
        dispatch(actions.addErrorMessage({
          message: msg,
        }));
      }
    }

    prevActionStatus = status;
  });

  const changeActionType = (ev: ChangeEvent<HTMLSelectElement>) => setActionType(ev.target.value);
  const changeActionName = (ev:ChangeEvent<HTMLInputElement>) => setActionName(ev.target.value);
  const changeUom = (ev:ChangeEvent<HTMLInputElement>) => setUom(ev.target.value);
  const changeUomQuantity = (ev:ChangeEvent<HTMLInputElement>) => setUomQuant(parseFloat(ev.target.value));
  const changeTransQuantity = (ev:ChangeEvent<HTMLInputElement>) => setTransQuant(parseFloat(ev.target.value));

  const addNewAction = () => {
    const _isActionTypeValid = actionType.length > 0;
    const _isActionNameValid = actionName.length > 0;
    const _isUomValid = uom.length > 0;
    const _isUomQuantValid = uomQuant > 0;
    const _isTransQuantValid = transQuant > 0;

    setIsActionTypeValid(_isActionTypeValid);
    setIsActionNameValid(_isActionNameValid);
    setIisUomValid(_isUomValid);
    setIsUomQuantValid(_isUomQuantValid);
    setIsTransQuantValid(_isTransQuantValid);

    if (!_isActionTypeValid
      || !_isActionNameValid
      || !_isUomValid
      || !_isUomQuantValid
      || !_isTransQuantValid
    ) {
      return;
    }

    setBusy(true);

    if (actionType === 'deposit') {
      dispatch(actions.addDepositAction({
        exchangeId: props.exchange.id,
        name: actionName,
        uom: uom,
        uomQuantity: uomQuant,
        depositQuantity: transQuant,
      }));
    } else {
      dispatch(actions.addWithdrawalAction({
        exchangeId: props.exchange.id,
        name: actionName,
        uom: uom,
        uomQuantity: uomQuant,
        withdrawalQuantity: transQuant,
      }));
    }

    // props.closeModal();
  };

  return (
    <div className='content'>
      <h3>Add New Action</h3>

      <div className='field'>
        <label className='label'>Action Type</label>
        <div className='control'>
          <div className={'select' + (isActionTypeValid ? '' : ' is-danger')}>
            <select onChange={changeActionType} value={actionType}>
              <option></option>
              <option value='deposit'>Deposit</option>
              <option value='withdrawal'>Withdrawal</option>
            </select>
          </div>
        </div>
        <p className={'help is-danger opacity-fade' + (isActionTypeValid ? ' invisible' : '')}>
          You Must Select an Action Type
        </p>
      </div>

      <div className='field'>
        <label className='label'>Name</label>
        <input
          className='input'
          type='text'
          placeholder='Name'
          value={actionName}
          onChange={changeActionName} />
        <p className={'help is-danger opacity-fade' + (isActionNameValid ? ' invisible' : '')}>
          You Must Add A Name
        </p>
      </div>

      <div className='field'>
        <label className='label'>Unit of Measure</label>
        <input
          className='input'
          type='text'
          placeholder='Name'
          value={uom}
          onChange={changeUom} />
        <p className={'help is-danger opacity-fade' + (isUomValid ? ' invisible' : '')}>
          You Must Add a Unit of Measure
        </p>
      </div>

      <div className='field'>
        <label className='label'>Transaction Quantity</label>
      </div>

      <div className='field'>
        <label className='label'>For Every Unit of Measure</label>
        <input
          className='input'
          type='number'
          min='0'
          placeholder='Name'
          value={uomQuant}
          onChange={changeUomQuantity} />
        <p className={'help is-danger opacity-fade' + (isUomQuantValid ? ' invisible' : '')}>
          This Must be a Number greater than 0
        </p>
      </div>

      <div className='field'>
        <label className='label'>You Transact This Much Currency</label>
        <input
          className='input'
          type='number'
          min='0'
          placeholder='Name'
          value={transQuant}
          onChange={changeTransQuantity} />
        <p className={'help is-danger opacity-fade' + (isTransQuantValid ? ' invisible' : '')}>
          This Must be a Number greater than 0
        </p>
      </div>

      <div className='field'>
        <div className='control'>
          <button
            disabled={busy}
            className={'button is-primary' + (busy ? ' is-loading' : '')}
            onClick={addNewAction}>
            Save
          </button>
        </div>
      </div>

    </div>
  );
}