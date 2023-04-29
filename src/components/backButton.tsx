import Link from "next/link";

export default (
	props:any
                ) => {
	return <Link href={'/'} {...props} className={`rounded-full aspect-square text-lg text-white text-start p-2 border border-white ${props.className}`}>
		<p>{"<-"}</p>
	</Link>
}