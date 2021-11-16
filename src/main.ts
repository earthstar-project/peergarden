import produce from 'immer';
import {
    LocalPeer,
    Thunk,
} from './lib/types';
import { makeId } from './lib/util';

type Cb<T> = (val: T) => void;
class ObservableTree<T> {
    tree: T;
    cbs: Set<Cb<T>> = new Set();
    constructor(init: T) {
        this.tree = init;
    }
    onChange(cb: Cb<T>): Thunk {
        this.cbs.add(cb);
        return () => this.cbs.delete(cb);
    }
    _bump(): void {
        for (let cb of this.cbs) { cb(this.tree); }
    }
    mutate(cb: (draft: T) => void): void {
        this.tree = produce(this.tree, cb);
        this._bump();
    }
}

//================================================================================

let localPeer: LocalPeer = {
    peerId: makeId(),
    gardens: {},
}
console.log('tree initial value is:');
console.log(JSON.stringify(localPeer, null, 4));

let tree = new ObservableTree<LocalPeer>(localPeer);

let unsub = tree.onChange((val) => {
    console.log('tree changed to:');
    console.log(JSON.stringify(val, null, 4));
});

tree.mutate((draft) => {
    draft.peerId = makeId();
});

