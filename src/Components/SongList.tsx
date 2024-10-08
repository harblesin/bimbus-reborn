import React, { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import type { Active, UniqueIdentifier } from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates
} from "@dnd-kit/sortable";

import { SongOverlay } from "./SongOverlay";
import styles from '../Styles/SongList.module.css';
import { SongHandle, SongItem } from './SongItem';

interface BaseItem {
    id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
    items: T[];
    onChange(items: T[]): void;
    renderItem(item: T): ReactNode;
    nowPlayingId: number;
}

export function SongList<T extends BaseItem>({
    items,
    onChange,
    renderItem,
    nowPlayingId
}: Props<T>) {
    const [active, setActive] = useState<Active | null>(null);
    const activeItem = useMemo(
        () => items.find((item) => item.id === active?.id),
        [active, items]
    );
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    return (
        <div className={styles.container}>
            <DndContext
                sensors={sensors}
                onDragStart={({ active }) => {
                    setActive(active);
                }}
                onDragEnd={({ active, over }) => {
                    if (over && active.id !== over?.id) {
                        const activeIndex = items.findIndex(({ id }) => id === active.id);
                        const overIndex = items.findIndex(({ id }) => id === over.id);

                        onChange(arrayMove(items, activeIndex, overIndex));
                    }
                    setActive(null);
                }}
                onDragCancel={() => {
                    setActive(null);
                }}
            >
                <SortableContext items={items}>
                    <ul className={styles.SortableList} role="application">
                        {items.map((item) => (
                            <span key={item.id} className={nowPlayingId === item.id ? styles.nowPlaying : null}>{renderItem(item)}</span>
                        ))}
                    </ul>
                </SortableContext>
                <SongOverlay>
                    {activeItem ? renderItem(activeItem) : null}
                </SongOverlay>
            </DndContext>
        </div>
    );
}

SongList.Item = SongItem;
SongList.DragHandle = SongHandle;
