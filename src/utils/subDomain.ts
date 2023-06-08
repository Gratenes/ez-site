import {Request, Response} from "express";

const subdomain = (subdomainName: string): ((req: Request, res: Response, next: () => void) => void) => {
	return (req: Request, res: Response, next: (arg1?:any) => void): void => {
		if (req.subdomains[0] === subdomainName) {
			next(); // Proceed to next middleware function
		} else {
			next("route");
		}
	};
};

export default subdomain