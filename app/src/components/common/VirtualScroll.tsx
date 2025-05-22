import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useEffect, useRef, useState } from 'react';


interface VirtualScrollProps<T> {
    items: T[];
    lastItem?: React.ReactNode;
    renderItem: (item: T, index: number) => Promise<React.ReactNode>;
    buffer: number;
    className?: string;
    initialIndex?: number;
    onIndexChange?: (index: number) => void;
}


export function VirtualScroll<T> (props: VirtualScrollProps<T>) {
    const parentRef = useRef(null)

    const rowVirtualizer = useVirtualizer({
        count: props.items.length + (props.lastItem ? 1 : 0),
        getScrollElement: () => parentRef.current,
        estimateSize: () => 300,
        overscan: props.buffer || 10,
        measureElement: el => el.getBoundingClientRect().height
    })    

    useEffect(() => {
        if (props.initialIndex !== undefined) {
            rowVirtualizer.scrollToIndex(props.initialIndex, { align: 'start' });
        }
    }, [props.initialIndex, rowVirtualizer]);

    useEffect(() => {
        props.onIndexChange?.(rowVirtualizer.range?.startIndex ?? 0);
    }, [rowVirtualizer.scrollElement?.scrollTop]);


    return (
        <div className={`overflow-auto h-full ${props.className ?? ''}`} ref={parentRef}>
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    if (virtualItem.index === props.items.length) {
                        return <VirtualItem key={virtualItem.key} virtualItem={virtualItem} rowVirtualizer={rowVirtualizer}>
                            {props.lastItem}
                        </VirtualItem>
                    }
                    
                    return <VirtualItem key={virtualItem.key} virtualItem={virtualItem} rowVirtualizer={rowVirtualizer}>
                        <AsyncItem item={props.items[virtualItem.index]} index={virtualItem.index} renderItem={props.renderItem} />
                    </VirtualItem>
            })}
            </div>
        </div>
    );
}



function AsyncItem<T>({ item, index, renderItem }: { item: T; index: number; renderItem: (item: T, index: number) => Promise<React.ReactNode> }) {
    const [content, setContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        let isMounted = true;
        renderItem(item, index).then((node) => {
            if (isMounted) setContent(node);
        });
        return () => { isMounted = false; };
    }, [item, index, renderItem]);

    return <div className="w-full">{content || <div className="h-[300px] flex items-center justify-center">Loading...</div>}</div>;
}

const VirtualItem = ({ virtualItem, rowVirtualizer, children }: { virtualItem: any; rowVirtualizer: any; children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const measure = () => rowVirtualizer.measureElement(el);
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [rowVirtualizer]);

    return (
        <div
            data-index={virtualItem.index}
            ref={ref}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
            }}
        >
            {children}
        </div>
    );
};