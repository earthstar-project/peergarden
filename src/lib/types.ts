
export type Thunk = () => void;

export type Protocol = 'http' | 'hyperswarm';
export type PeerId = string;
export type StorageId = string;
export type WorkspaceId = string;
export type Timestamp = number;

export interface LocalPeer {
    peerId: PeerId;
    foo: string;
    gardens: Partial<Record<Protocol, PeerGarden>>;
}

export interface PeerGarden {
    peers: Record<PeerId, RemotePeer>;
}

export interface RemotePeer {
    peerId: PeerId;
    lastSeen: Timestamp;
    storages: Record<StorageId, WorkspaceId>;
}

