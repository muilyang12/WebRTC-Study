import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Drawing() {
  const router = useRouter();
  const { roomName } = router.query;

  useEffect(() => {
    if (!roomName) return;
  }, [roomName]);

  return <></>;
}
