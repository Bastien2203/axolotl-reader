

type PaginationProps = {
    page: number;
    onPageChange: (page: number) => void;
    totalPages: number;
}

const Pagination = (props: PaginationProps) => (
    <>
        {
            props.totalPages > 1 && (
                <div className="w-full flex justify-center">
                    <div className="join">
                        {Array.from({ length: props.totalPages }, (_, i) => {
                            const pageNumber = i + 1;
                            const isActive = pageNumber === props.page;
                            const isHidden = props.totalPages > 10 && pageNumber > 4 && pageNumber < props.totalPages - 5;

                            return (
                                !isHidden && (
                                    <button
                                        key={pageNumber}
                                        className={`join-item btn ${isActive ? "btn-active" : ""}`}
                                        onClick={() => props.onPageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            );
                        })}
                    </div>
                </div>
            )
        }
    </>
)

export default Pagination;