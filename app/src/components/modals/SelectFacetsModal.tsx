import { useRef, useEffect } from "react";
import Modal from "../common/Modal";
import { Facets } from "../../types";

type SelectFacetsModalProps = {
    facetsModalOpen: {
        type: "authors" | "series" | "tags",
        values: string[]
    } | null;
    setFacetsModalOpen: (facets: {
        type: "authors" | "series" | "tags",
        values: string[]
    } | null) => void;
    selectedFacets: Facets | null;
    setSelectedFacets: (facets: Facets | null) => void;
}
const SelectFacetsModal = (props: SelectFacetsModalProps) => {
    const facetsModalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!facetsModalRef.current) return;
        if (props.facetsModalOpen != null) {
            facetsModalRef.current.showModal();
        } else {
            facetsModalRef.current.close();
        }
    }, [props.facetsModalOpen]);

    return <Modal id="facets-modal" ref={facetsModalRef} onClose={() => {
        props.setFacetsModalOpen(null);
    }}>
    <div className="modal-box">
        <h2 className="font-bold text-lg">Filter by {props.facetsModalOpen?.type}</h2>
        <div className="flex flex-col gap-2">
            {
                props.facetsModalOpen?.values.map((facet) => (
                    <label key={facet} className="flex items-center gap-2">
                        <input type="checkbox" className="checkbox" defaultChecked={
                        props.facetsModalOpen ?
                        props.selectedFacets?.facets[props.facetsModalOpen.type]?.includes(facet) : false
                    } onChange={ (e) => {
                        const checked = e.target.checked;
                        // in selectedFacets, if the facet is already there, remove it, otherwise add it
                        if (props.facetsModalOpen == null) return;

                        if (checked) {
                            props.setSelectedFacets({
                                ...props.selectedFacets,
                                facets: {
                                    ...props.selectedFacets?.facets,
                                    [props.facetsModalOpen.type]: [
                                        ...(props.selectedFacets?.facets[props.facetsModalOpen.type] ?? []),
                                        facet
                                    ]
                                }
                            });
                        }
                        else {
                            props.setSelectedFacets({
                                ...props.selectedFacets,
                                facets: {
                                    ...props.selectedFacets?.facets,
                                    [props.facetsModalOpen.type]: [
                                        ...(props.selectedFacets?.facets[props.facetsModalOpen.type] ?? []).filter((f) => f !== facet)
                                    ]
                                }
                            });
                        }
                    }}/>
                        {facet}
                    </label>
                ))
            }
           
        </div>
        <div className="modal-action">
            <button className="btn btn-primary" onClick={() => props.setFacetsModalOpen(null)}>Ok</button>
        </div>
    </div>
</Modal>
}

export default SelectFacetsModal;