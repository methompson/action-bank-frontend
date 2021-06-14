import { isRecord } from 'shared/typeguards';

export enum RequestStatusType {
  Idle,
  Pending,
  Success,
  Fail,
}

export interface RequestStatus {
  status: RequestStatusType,
  msg: string,
}

export interface ActionBankState {
  exchanges: Record<string, ExchangeData>,
  lastTimeRetrieved: number,
  exchangeRequest: RequestStatus,
  depositActionRequest: RequestStatus,
}

export interface NewExchange {
  name: string,
  description: string,
}

export interface ExchangeData {
  id: string,
  name: string,
  description: string,
  totalCurrency: number,
  depositActions: DepositActionData[],
  withdrawalActions: WithdrawalActionData[],
  deposits: DepositData[],
  withdrawals: WithdrawalData[],
  depositCount: number,
  withdrawalCount: number,
}

export class Exchange {
  constructor(
    protected _id: string,
    protected _name: string,
    protected _description: string,
    protected _totalCurrency: number,
    protected _depositActions: DepositAction[],
    protected _withdrawalActions: WithdrawalAction[],
    protected _deposits: Deposit[],
    protected _withdrawals: Withdrawal[],
    protected _depositCount: number,
    protected _withdrawalCount: number,
  ) {}

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get totalCurrency(): number { return this._totalCurrency; }
  get depositActions(): DepositAction[] { return this._depositActions; }
  get withdrawalActions(): WithdrawalAction[] { return this._withdrawalActions; }
  get deposits(): Deposit[] { return this._deposits; }
  get withdrawals(): Withdrawal[] { return this._withdrawals; }

  get depositCount(): number { return this._depositCount; }
  get withdrawalCount(): number { return this._withdrawalCount; }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      totalCurrency: this.totalCurrency,
      depositActions: this.depositActions,
      withdrawalActions: this.withdrawalActions,
      deposits: this.deposits,
      withdrawals: this.withdrawals,
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  get exchangeData(): ExchangeData {
    const depositActionData: DepositActionData[] = this.depositActions.map((el) => {
      return el.depositActionData;
    });
    const withdrawalActionData: WithdrawalActionData[] = this.withdrawalActions.map((el) => {
      return el.withdrawalActionData;
    });
    const depositData: DepositData[] = this.deposits.map((el) => {
      return el.depositData;
    });
    const withdrawalData: WithdrawalData[] = this.withdrawals.map((el) => {
      return el.withdrawalData;
    });

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      totalCurrency: this.totalCurrency,
      depositActions: depositActionData,
      withdrawalActions: withdrawalActionData,
      deposits: depositData,
      withdrawals: withdrawalData,
      depositCount: this.depositCount,
      withdrawalCount: this.withdrawalCount,
    };
  }

  static isExchange(value: Exchange | unknown | null | undefined): value is Exchange {
    let val;
    try {
      val = value as Record<string, unknown>;
    } catch(e) {
      return false;
    }

    if (typeof val !== 'object'
      || Array.isArray(val)
      || val === null
      || typeof val.id !== 'string'
      || typeof val.name !== 'string'
      || !Array.isArray(val.depositActions)
      || !Array.isArray(val.withdrawalActions)
      || !Array.isArray(val.deposits)
      || !Array.isArray(val.withdrawals)
    ) {
      return false;
    }

    for (const el of val.depositActions) {
      if (!DepositAction.isDepositAction(el)) {
        return false;
      }
    }

    for (const el of val.withdrawalActions) {
      if (!WithdrawalAction.isWithdrawalAction(el)) {
        return false;
      }
    }

    for (const el of val.deposits) {
      if (!Deposit.isDeposit(el)) {
        return false;
      }
    }

    for (const el of val.withdrawals) {
      if (!Withdrawal.isWithdrawal(el)) {
        return false;
      }
    }

    return true;
  }

  static fromExchangeData(ex: ExchangeData): Exchange {
    const depositActions = ex.depositActions.map((el) => {
      return DepositAction.fromDepositActionData(el);
    });

    const withdrawalActions = ex.withdrawalActions.map((el) => {
      return WithdrawalAction.fromWithdrawalAction(el);
    });

    const deposits = ex.deposits.map((el) => {
      return Deposit.fromDepositData(el);
    });

    const withdrawals = ex.withdrawals.map((el) => {
      return Withdrawal.fromWithdrawalData(el);
    });

    return new Exchange(
      ex.id,
      ex.name,
      ex.description,
      ex.totalCurrency,
      depositActions,
      withdrawalActions,
      deposits,
      withdrawals,
      ex.depositCount,
      ex.withdrawalCount,
    );
  }

  static fromNewExchange(ex: NewExchange, id: string): Exchange {
    return new Exchange(
      id,
      ex.name,
      ex.description,
      0,
      [],
      [],
      [],
      [],
      0,
      0,
    );
  }

  static fromJSON(results: unknown): Exchange {
    if (!isRecord(results)) throw new Error('Invalid Type');

    if (typeof results.id !== 'string'
      || typeof results.name !== 'string'
      || typeof results.description !== 'string'
      || typeof results.totalCurrency !== 'number'
      || !Array.isArray(results.depositActions)
      || !Array.isArray(results.withdrawalActions)
      || !Array.isArray(results.deposits)
      || !Array.isArray(results.withdrawals)
      || typeof results.depositCount !== 'number'
      || typeof results.withdrawalCount !== 'number'
    ) {
      throw new Error('Invalid Type');
    }

    const depositActions: DepositAction[] = [];
    const withdrawalActions: WithdrawalAction[] = [];
    const deposits: Deposit[] = [];
    const withdrawals: Withdrawal[] = [];

    for (const el of results.depositActions)
      depositActions.push(DepositAction.fromDynamic(el));
    for (const el of results.withdrawalActions)
      withdrawalActions.push(WithdrawalAction.fromDynamic(el));
    for (const el of results.deposits)
      deposits.push(Deposit.fromDynamic(el));
    for (const el of results.withdrawals)
      withdrawals.push(Withdrawal.fromDynamic(el));

    return new Exchange(
      results.id,
      results.name,
      results.description,
      results.totalCurrency,
      depositActions,
      withdrawalActions,
      deposits,
      withdrawals,
      results.depositCount,
      results.withdrawalCount,
    );
  }
}

export interface NewDepositActionData {
  exchangeId: string,
  name: string,
  uom: string,
  uomQuantity: number,
  depositQuantity: number,
}

export interface DepositActionData {
  id: string,
  name: string,
  uom: string,
  uomQuantity: number,
  depositQuantity: number,
}

export class DepositAction {
  constructor(
    protected _id: string,
    protected _name: string,
    protected _uom: string,
    protected _uomQuantity: number,
    protected _depositQuantity: number,
  ) {}

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get uom(): string { return this._uom; }
  get uomQuantity(): number { return this._uomQuantity; }
  get depositQuantity(): number { return this._depositQuantity; }

  get depositActionData(): DepositActionData {
    return {
      id: this.id,
      name: this.name,
      uom: this.uom,
      uomQuantity: this.uomQuantity,
      depositQuantity: this.depositQuantity,
    };
  }

  toJSON() { return this.depositActionData; }

  static isDepositAction(value: DepositAction | unknown | null | undefined): value is DepositAction {
    if (!isRecord(value)) return false;

    return value !== null
      && value !== undefined
      && typeof value.id === 'string'
      && typeof value.name === 'string'
      && typeof value.uom === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.depositQuantity === 'number';
  }

  static fromDepositActionData(value: DepositActionData): DepositAction {
    return new DepositAction(
      value.id,
      value.name,
      value.uom,
      value.uomQuantity,
      value.depositQuantity,
    );
  }

  static fromNewDepositActionData(value: NewDepositActionData, id: string): DepositAction {
    return new DepositAction(
      id,
      value.name,
      value.uom,
      value.uomQuantity,
      value.depositQuantity,
    );
  }

  static fromDynamic(value: unknown): DepositAction {
    if (!DepositAction.isDepositAction(value)) throw new Error('Invalid Data');

    return new DepositAction(
      value.id,
      value.name,
      value.uom,
      value.uomQuantity,
      value.depositQuantity,
    );
  }
}

export interface NewWithdrawalAction {
  name: string,
  uom: string,
  uomQuantity: number,
  withdrawalQuantity: number,
}

export interface WithdrawalActionData {
  id: string,
  name: string,
  uom: string,
  uomQuantity: number,
  withdrawalQuantity: number,
}

export class WithdrawalAction {
  constructor(
    protected _id: string,
    protected _name: string,
    protected _uom: string,
    protected _uomQuantity: number,
    protected _withdrawalQuantity: number,
  ) {}

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get uom(): string { return this._uom; }
  get uomQuantity(): number { return this._uomQuantity; }
  get withdrawalQuantity(): number { return this._withdrawalQuantity; }

  get withdrawalActionData(): WithdrawalActionData {
    return {
      id: this.id,
      name: this.name,
      uom: this.uom,
      uomQuantity: this.uomQuantity,
      withdrawalQuantity: this.withdrawalQuantity,
    };
  }

  toJSON() { return this.withdrawalActionData; }

  static isWithdrawalAction(value: WithdrawalAction | unknown | null | undefined): value is WithdrawalAction {
    if (!isRecord(value)) return false;

    return value !== null
      && typeof value.id === 'string'
      && typeof value.name === 'string'
      && typeof value.uom === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.withdrawalQuantity === 'number';
  }

  static fromWithdrawalAction(value: WithdrawalActionData): WithdrawalAction {
    return new WithdrawalAction(
      value.id,
      value.name,
      value.uom,
      value.uomQuantity,
      value.withdrawalQuantity,
    );
  }

  static fromDynamic(value: unknown): WithdrawalAction {
    if (!WithdrawalAction.isWithdrawalAction(value)) throw new Error('Invalid Data');

    return new WithdrawalAction(
      value.id,
      value.name,
      value.uom,
      value.uomQuantity,
      value.withdrawalQuantity,
    );
  }
}

export interface NewDeposit {}

export interface DepositData {
  id: string,
  depositActionId: string,
  depositActionName: string,
  uomQuantity: number,
  depositQuantity: number,
  quantity: number,
}

export class Deposit {
  constructor(
    protected _id: string,
    protected _depositActionId: string,
    protected _depositActionName: string,
    protected _uomQuantity: number,
    protected _depositQuantity: number,
    protected _quantity: number,
  ) {}

  get id(): string { return this._id; }
  get depositActionId(): string { return this._depositActionId; }
  get depositActionName(): string { return this._depositActionName; }
  get uomQuantity(): number { return this._uomQuantity; }
  get depositQuantity(): number { return this._depositQuantity; }
  get quantity(): number { return this._quantity; }

  get depositData(): DepositData {
    return {
      id: this.id,
      depositActionId: this.depositActionId,
      depositActionName: this.depositActionName,
      uomQuantity: this.uomQuantity,
      depositQuantity: this.depositQuantity,
      quantity: this.quantity,
    };
  }

  toJSON() { return this.depositData; }

  static isDeposit(value: Deposit | unknown | null | undefined): value is Deposit {
    if (!isRecord(value)) return false;

    return value !== null
      && typeof value.id === 'string'
      && typeof value.depositActionId === 'string'
      && typeof value.depositActionName === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.depositQuantity === 'number'
      && typeof value.quantity === 'number';
  }

  static fromDepositData(value: DepositData): Deposit {
    return new Deposit(
      value.id,
      value.depositActionId,
      value.depositActionName,
      value.uomQuantity,
      value.depositQuantity,
      value.quantity,
    );
  }

  static fromDynamic(value: unknown): Deposit {
    if (!Deposit.isDeposit(value)) throw new Error('Invalid Data');

    return new Deposit(
      value.id,
      value.depositActionId,
      value.depositActionName,
      value.uomQuantity,
      value.depositQuantity,
      value.quantity,
    );
  }
}

export interface NewWithdrawal {}

export interface WithdrawalData {
  id: string,
  withdrawalActionId: string,
  withdrawalActionName: string,
  uomQuantity: number,
  withdrawalQuantity: number,
  quantity: number,
}

export class Withdrawal {
  constructor(
    protected _id: string,
    protected _withdrawalActionId: string,
    protected _withdrawalActionName: string,
    protected _uomQuantity: number,
    protected _withdrawalQuantity: number,
    protected _quantity: number,
  ) {}

  get id(): string { return this._id; }
  get withdrawalActionId(): string { return this._withdrawalActionId; }
  get withdrawalActionName(): string { return this._withdrawalActionName; }
  get uomQuantity(): number { return this._uomQuantity; }
  get withdrawalQuantity(): number { return this._withdrawalQuantity; }
  get quantity(): number { return this._quantity; }

  get withdrawalData(): WithdrawalData {
    return {
      id: this.id,
      withdrawalActionId: this.withdrawalActionId,
      withdrawalActionName: this.withdrawalActionName,
      uomQuantity: this.uomQuantity,
      withdrawalQuantity: this.withdrawalQuantity,
      quantity: this.quantity,
    };
  }

  toJSON() { return this.withdrawalData; }

  static isWithdrawal(value: Withdrawal | unknown | null | undefined): value is Withdrawal {
    if (!isRecord(value)) return false;

    return value !== null
      && typeof value.id === 'string'
      && typeof value.withdrawalActionId === 'string'
      && typeof value.withdrawalActionName === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.withdrawalQuantity === 'number'
      && typeof value.quantity === 'number';
  }

  static fromWithdrawalData(value: WithdrawalData): Withdrawal {
    return new Withdrawal(
      value.id,
      value.withdrawalActionId,
      value.withdrawalActionName,
      value.uomQuantity,
      value.withdrawalQuantity,
      value.quantity,
    );
  }

  static fromDynamic(value: unknown): Withdrawal {
    if (!Withdrawal.isWithdrawal(value)) throw new Error('Invalid Data');

    return new Withdrawal(
      value.id,
      value.withdrawalActionId,
      value.withdrawalActionName,
      value.uomQuantity,
      value.withdrawalQuantity,
      value.quantity,
    );
  }
}
