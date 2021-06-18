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
  withdrawalActionRequest: RequestStatus,
  depositRequest: RequestStatus,
  withdrawalRequest: RequestStatus,
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
  protected _depositActionMap: Record<string, DepositAction> = {};
  protected _withdrawalActionMap: Record<string, WithdrawalAction> = {};

  protected _depositMap: Record<string, Deposit> = {};
  protected _withdrawalMap: Record<string, Withdrawal> = {};

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
  ) {
    for (const action of _depositActions) {
      this._depositActionMap[action.id] = action;
    }

    for (const action of _withdrawalActions) {
      this._withdrawalActionMap[action.id] = action;
    }

    for (const dep of _deposits) {
      this._depositMap[dep.id] = dep;
    }

    for (const wd of _withdrawals) {
      this._withdrawalMap[wd.id] = wd;
    }
  }

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

  getDepositActionById(id: string) { return this._depositActionMap[id]; }
  getWithdrawalActionById(id: string) { return this._withdrawalActionMap[id]; }

  addDepositAction(action: DepositAction) {
    this._depositActions.push(action);
    this._depositActionMap[action.id] = action;
  }

  addWithdrawalAction(action: WithdrawalAction) {
    this._withdrawalActions.push(action);
    this._withdrawalActionMap[action.id] = action;
  }

  getDepositById(id: string) { return this._depositMap[id]; }
  getWithdrawalById(id: string) { return this._withdrawalMap[id]; }

  addDeposit(deposit: Deposit, depositCount?: number, totalCurrency?: number) {
    this._deposits.push(deposit);
    this._depositMap[deposit.id] = deposit;

    if (depositCount !== undefined) {
      this._depositCount = depositCount;
    } else {
      this._depositCount += 1;
    }

    if (totalCurrency !== undefined) {
      this._totalCurrency = totalCurrency;
    }
  }

  addWithdrawal(withdrawal: Withdrawal, withdrawalCount?: number, totalCurrency?: number) {
    this._withdrawals.push(withdrawal);
    this._withdrawalMap[withdrawal.id] = withdrawal;

    if (withdrawalCount !== undefined) {
      this._withdrawalCount = withdrawalCount;
    } else {
      this._withdrawalCount += 1;
    }

    if (totalCurrency !== undefined) {
      this._totalCurrency = totalCurrency;
    }
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
      return WithdrawalAction.fromWithdrawalActionData(el);
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

export interface DepositActionData extends NewDepositActionData {
  id: string,
}

export class DepositAction {
  constructor(
    protected _id: string,
    protected _exchangeId: string,
    protected _name: string,
    protected _uom: string,
    protected _uomQuantity: number,
    protected _depositQuantity: number,
  ) {}

  get id(): string { return this._id; }
  get exchangeId(): string { return this._exchangeId; }
  get name(): string { return this._name; }
  get uom(): string { return this._uom; }
  get uomQuantity(): number { return this._uomQuantity; }
  get depositQuantity(): number { return this._depositQuantity; }

  get depositActionData(): DepositActionData {
    return {
      id: this.id,
      exchangeId: this.exchangeId,
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
      && typeof value.exchangeId === 'string'
      && typeof value.name === 'string'
      && typeof value.uom === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.depositQuantity === 'number';
  }

  static fromDepositActionData(value: DepositActionData): DepositAction {
    return new DepositAction(
      value.id,
      value.exchangeId,
      value.name,
      value.uom,
      value.uomQuantity,
      value.depositQuantity,
    );
  }

  static fromNewDepositActionData(value: NewDepositActionData, id: string): DepositAction {
    return new DepositAction(
      id,
      value.exchangeId,
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
      value.exchangeId,
      value.name,
      value.uom,
      value.uomQuantity,
      value.depositQuantity,
    );
  }
}

export interface NewWithdrawalActionData {
  exchangeId: string,
  name: string,
  uom: string,
  uomQuantity: number,
  withdrawalQuantity: number,
}

export interface WithdrawalActionData extends NewWithdrawalActionData{
  id: string,
}

export class WithdrawalAction {
  constructor(
    protected _id: string,
    protected _exchangeId: string,
    protected _name: string,
    protected _uom: string,
    protected _uomQuantity: number,
    protected _withdrawalQuantity: number,
  ) {}

  get id(): string { return this._id; }
  get exchangeId(): string { return this._exchangeId; }
  get name(): string { return this._name; }
  get uom(): string { return this._uom; }
  get uomQuantity(): number { return this._uomQuantity; }
  get withdrawalQuantity(): number { return this._withdrawalQuantity; }

  get withdrawalActionData(): WithdrawalActionData {
    return {
      id: this.id,
      exchangeId: this.exchangeId,
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
      && typeof value.exchangeId === 'string'
      && typeof value.name === 'string'
      && typeof value.uom === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.withdrawalQuantity === 'number';
  }

  static fromWithdrawalActionData(value: WithdrawalActionData): WithdrawalAction {
    return new WithdrawalAction(
      value.id,
      value.exchangeId,
      value.name,
      value.uom,
      value.uomQuantity,
      value.withdrawalQuantity,
    );
  }

  static fromNewWithdrawalActionData(value: NewWithdrawalActionData, id: string): WithdrawalAction {
    return new WithdrawalAction(
      id,
      value.exchangeId,
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
      value.exchangeId,
      value.name,
      value.uom,
      value.uomQuantity,
      value.withdrawalQuantity,
    );
  }
}

export interface NewDeposit {
  depositAction: DepositAction,
  quantity: number,
}

export interface DepositData {
  id: string,
  exchangeId: string,
  depositActionId: string,
  depositActionName: string,
  uomQuantity: number,
  depositQuantity: number,
  quantity: number,
}

export interface AddDepositData {
  depositData: DepositData,
  totalDeposits: number,
  totalFunds: number,
}

export class Deposit {
  constructor(
    protected _id: string,
    protected _exchangeId: string,
    protected _depositActionId: string,
    protected _depositActionName: string,
    protected _uomQuantity: number,
    protected _depositQuantity: number,
    protected _quantity: number,
  ) {}

  get id(): string { return this._id; }
  get exchangeId(): string { return this._exchangeId; }
  get depositActionId(): string { return this._depositActionId; }
  get depositActionName(): string { return this._depositActionName; }
  get uomQuantity(): number { return this._uomQuantity; }
  get depositQuantity(): number { return this._depositQuantity; }
  get quantity(): number { return this._quantity; }

  get depositData(): DepositData {
    return {
      id: this.id,
      exchangeId: this.exchangeId,
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
      && typeof value.exchangeId === 'string'
      && typeof value.depositActionId === 'string'
      && typeof value.depositActionName === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.depositQuantity === 'number'
      && typeof value.quantity === 'number';
  }

  static fromDepositData(value: DepositData): Deposit {
    return new Deposit(
      value.id,
      value.exchangeId,
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
      value.exchangeId,
      value.depositActionId,
      value.depositActionName,
      value.uomQuantity,
      value.depositQuantity,
      value.quantity,
    );
  }

  static fromNewDeposit(id: string, quantity: number, depositAction: DepositAction): Deposit {
    return new Deposit(
      id,
      depositAction.exchangeId,
      depositAction.id,
      depositAction.name,
      depositAction.uomQuantity,
      depositAction.depositQuantity,
      quantity,
    );
  }
}

export interface NewWithdrawal {
  withdrawalAction: WithdrawalAction,
  quantity: number,
}

export interface WithdrawalData {
  id: string,
  exchangeId: string,
  withdrawalActionId: string,
  withdrawalActionName: string,
  uomQuantity: number,
  withdrawalQuantity: number,
  quantity: number,
}

export interface AddWithdrawalData {
  withdrawalData: WithdrawalData,
  totalWithdrawals: number,
  totalFunds: number,
}

export class Withdrawal {
  constructor(
    protected _id: string,
    protected _exchangeId: string,
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
      exchangeId: this._exchangeId,
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
      && typeof value.exchangeId === 'string'
      && typeof value.withdrawalActionId === 'string'
      && typeof value.withdrawalActionName === 'string'
      && typeof value.uomQuantity === 'number'
      && typeof value.withdrawalQuantity === 'number'
      && typeof value.quantity === 'number';
  }

  static fromWithdrawalData(value: WithdrawalData): Withdrawal {
    return new Withdrawal(
      value.id,
      value.exchangeId,
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
      value._exchangeId,
      value.withdrawalActionId,
      value.withdrawalActionName,
      value.uomQuantity,
      value.withdrawalQuantity,
      value.quantity,
    );
  }

  static fromNewWithdrawal(id: string, quantity: number, withdrawalAction: WithdrawalAction): Withdrawal {
    return new Withdrawal(
      id,
      withdrawalAction.exchangeId,
      withdrawalAction.id,
      withdrawalAction.name,
      withdrawalAction.uomQuantity,
      withdrawalAction.withdrawalQuantity,
      quantity,
    );
  }
}
