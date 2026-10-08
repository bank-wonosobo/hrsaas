import Title from "@/components/ui/title/title";
import DetailCreditCollection from "@/features/credit-collection/components/detail-credit-collection";

type Props = {
  params: Promise<{ noPjm: string }>;
};

export default async function CreditCollectionDetailPage({ params }: Props) {
  const { noPjm } = await params;

  return (
    <>
      <Title title={`Detail penagihan ${noPjm}`} previus="/credit-collections" />
      <DetailCreditCollection noPjm={noPjm} />
    </>
  );
}
