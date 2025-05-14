import { Facets, Series } from "../types";


export type FacetsFilterProps = {
    type: "authors" | "series" | "tags";
    facets: Facets;
    onFacetsButtonClick: (type: "authors" | "series" | "tags", values: string[] | Series[]) => void;
    selectedFacets: Facets | null;
    onSelectedFacetsChange: (facets: Facets | null) => void;
};

const FacetsFilter = ({ type, facets, onFacetsButtonClick, selectedFacets, onSelectedFacetsChange }: FacetsFilterProps) => {
    const currentFacets = facets.facets[type] ?? [];
    const selectedTypeFacets = selectedFacets?.facets[type] ?? [];

    const handleRemoveFacet = (facet: string) => {
        if (!selectedFacets?.facets[type]) return;
        onSelectedFacetsChange({
            ...selectedFacets,
            facets: {
                ...selectedFacets.facets,
                [type]: selectedTypeFacets.filter((f) => f !== facet),
            },
        });
    };

    return currentFacets.length > 0 ? (
        <div className="flex gap-2">
            <button
                className="btn btn-primary"
                onClick={() => onFacetsButtonClick(type, currentFacets)}
            >
                Filter by {type}
            </button>
            {selectedTypeFacets.length > 0 && (
                selectedTypeFacets.map((facet,i) => (
                    <span key={i} className="h-full bg-secondary rounded p-2 px-4 flex gap-2">
                        {typeof facet === "string" ? facet : facet.name}
                        <button
                            className="btn btn-xs btn-circle btn-ghost"
                            onClick={() => handleRemoveFacet(typeof facet === "string" ? facet : facet.name)}
                        >
                            ✕
                        </button>
                    </span>
                ))
            )}
        </div>
    ) : null;
};

export default FacetsFilter;