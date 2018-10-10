export default class Writer {
    private value: any;
    private log: any[];
    static of(value) {
        return new Writer(value, []);
    }
    static lift(fn) {
        return (...args) => Writer.of(fn(...args));
    }
    constructor(value, log = []) {
        this.value = value;
        this.log = log;
    }
    read() {
        return { value: this.value, log: this.log };
    }
    map(fn) {
        return new Writer(fn(this.value), this.log);
    }
    ap(other) {
        return this.chain(fn => other.map(fn));
    }
    chain(fn) {
        const inner = fn(this.value).read();
        return new Writer(inner.value, this.log.concat(inner.log));
    }
}
