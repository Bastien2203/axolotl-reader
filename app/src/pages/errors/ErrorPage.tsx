import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";

const ErrorPage = () => {
  const error = useRouteError();

  let title = "Something went wrong.";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} - ${error.statusText}`;
    message = error.data || message;
  }

  return (
    <>
    <PageLayout>
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <div className="hero rounded-xl p-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">{title}</h1>
              <p className="py-4 text-lg text-gray-500">{message}</p>
              <Link to="/" className="btn btn-primary mt-4">Go back home</Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
    </>
  );
};

export default ErrorPage;
