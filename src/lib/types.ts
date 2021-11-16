
export type Thunk = () => void;

export type Protocol = 'http' | 'hyperswarm';
export type PeerId = string;
export type StorageId = string;
export type WorkspaceId = string;

export interface LocalPeer {
    gardens: Partial<Record<Protocol, PeerGarden>>;
}

export interface PeerGarden {
    peers: Record<PeerId, RemotePeer>;
}

export interface RemotePeer {
    peerId: PeerId;
    storages: Record<StorageId, WorkspaceId>;
}

