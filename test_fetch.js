async function test() {
    const url = "https://pqwtagrqcvf4wrr7.public.blob.vercel-storage.com/documents/cmmhldg0s0000ju04abqpo7sl/1774469540600-immidit%20%E2%80%94%20Angel%20Investment%20Summary.pdf";
    const res = await fetch(url);
    if (!res.ok) {
        console.error("Failed:", res.status, res.statusText);
    } else {
        console.log("Success! Content length:", res.headers.get("content-length"));
        console.log("Content-Type:", res.headers.get("content-type"));
    }
}
test();
