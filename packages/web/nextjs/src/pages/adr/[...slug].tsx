import { GetStaticProps, GetStaticPaths } from "next";
import { getLog4brainsInstance } from "../../lib/core-api";
import { getConfig } from "../../lib/next";
import { AdrScene, AdrSceneProps } from "../../scenes";
import { toAdr } from "../../lib-shared/types";

export default AdrScene;

export const getStaticPaths: GetStaticPaths = async () => {
  const adrs = await getLog4brainsInstance().searchAdrs();
  const paths = adrs.map((adr) => {
    return { params: { slug: adr.slug.split("/") } };
  });
  return {
    paths,
    // Always allow on-demand generation for unknown slugs.
    // This ensures nested package ADRs (e.g., cab/...) resolve both during
    // preview and after static export even if they were not present at build time.
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<AdrSceneProps> = async ({
  params,
}) => {
  const l4bInstance = getLog4brainsInstance();

  if (params === undefined || !params.slug) {
    return { notFound: true };
  }

  const parts = Array.isArray(params.slug)
    ? (params.slug).map((p) => decodeURIComponent(p))
    : [decodeURIComponent(String(params.slug))];
  const currentSlug = parts.join("/");
  const currentAdr = await l4bInstance.getAdrBySlug(currentSlug);
  if (!currentAdr) {
    return { notFound: true };
  }

  return {
    props: {
      projectName: l4bInstance.config.project.name,
      currentAdr: toAdr(
        currentAdr,
        currentAdr.supersededBy
          ? await l4bInstance.getAdrBySlug(currentAdr.supersededBy)
          : undefined
      ),
      l4bVersion: getConfig().serverRuntimeConfig.VERSION,
    },
    revalidate: 1,
  };
};
