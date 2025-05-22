import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import PageLayout from "../layout/PageLayout";
import { Facet, navigationDocument } from "../services/OPDS";
import FacetCarroussel from "../components/FacetCarroussel";




const Home = () => {
  const [facets, setFacets] = useState<Facet[]>();
  const { showToast } = useToast();

  useEffect(() => {
    navigationDocument().then((feed) => {
      if (feed.facets) {
        setFacets(feed.facets);
      }
    }).catch((err) => {
      console.error(err);
      showToast({
        message: "Error loading series",
        type: "alert-error"
      });
    })
  }, []);



  return <PageLayout title="Home">
    <h2 className="text-xl font-semibold">Series by categories</h2>

    {
      facets?.map((facet,i) => (
        <FacetCarroussel key={i} facet={facet}  />
      ))
    }


  </PageLayout>
}

export default Home;