import produce from 'immer';
import {
    LocalPeer,
    Thunk,
} from './lib/types';
import { makeId } from './lib/util';

type OnChangeCb<T> = (val: T) => void;
type Selector<T> = (tree: T) => any;
type SelectorCb = (val: any) => void;
class ObservableTree<T> {
    tree: T;
    _selectors: Map<Selector<T>, SelectorCb> = new Map();
    constructor(init: T) {
        this.tree = init;
    }
    //--------------------------------------------------
    // ADD SUBSCRIPTIONS
    watch(selector: Selector<T>, selectorCb: SelectorCb): Thunk {
        this._selectors.set(selector, selectorCb);
        return () => this._selectors.delete(selector);
    }
    watchTree(cb: OnChangeCb<T>): Thunk {
        // this is just an easy way to catch any change to the entire tree.
        // it can also be accomplished using regular watch().
        return this.watch(
            (tree: T) => tree,
            cb,
        );
    }
    //--------------------------------------------------
    // TRIGGER SUBSCRIPTIONS
    _bump(oldTree: T, newTree: T): void {
        if (oldTree === newTree) { return; }
        for (let [selector, selCb] of this._selectors.entries()) {
            let oldSelected = selector(oldTree);
            let newSelected = selector(newTree);
            if (oldSelected !== newSelected) {
                selCb(newSelected);
            }
        }
    }
    //--------------------------------------------------
    // MODIFY TREE
    mutate(cb: (draft: T) => void): void {
        let oldTree = this.tree;
        this.tree = produce(this.tree, cb);
        this._bump(oldTree, this.tree);
    }
}

//================================================================================

let localPeer: LocalPeer = {
    peerId: makeId(),
    foo: 'bar',
    gardens: {},
}
console.log('tree initial value is:');
console.log(JSON.stringify(localPeer, null, 4));
console.log();

let tree = new ObservableTree<LocalPeer>(localPeer);

let unsub = tree.watchTree((val) => {
    console.log('watchTree: entire tree changed to:');
    console.log(JSON.stringify(val, null, 4));
});

let unsub2 = tree.watch(
    (tree) => tree.peerId,
    (val) => {
        console.log('watch: peerId changed to:', val);
    }
);

let unsub3 = tree.watch(
    // TODO: this triggers every time because it creates a new Array object
    // instead of just pointing at one of the frozen immutable things in the tree...
    // We need another function, watchDeep(), that does a deep equality check to test this?
    // Or maybe if the value we return is not frozen, we automatically do a deep check?
    (tree) => Object.keys(tree.gardens.http?.peers || {}),
    (val) => {
        console.log('watch: array of http peer ids changed to:');
        console.log('    ', JSON.stringify(val));
    }
);

console.log('---------------------------------------------');
console.log('--- changing local peer id ---');
tree.mutate((draft) => {
    draft.peerId = makeId();
});

console.log('---------------------------------------------');
console.log('--- changing local peer foo from bar to baz ---');
tree.mutate((draft) => {
    draft.foo = 'baz';
});

console.log('---------------------------------------------');
console.log('--- filling out http garden ---');
tree.mutate((draft) => {
    draft.gardens.http = {
        peers: {
            'peer12345': {
                peerId: 'peer12345',
                lastSeen: Date.now(),
                storages: {
                    'storageABCDE': '+gardening.ajdfwoiefjaof',
                },
            }
        }
    }
});


