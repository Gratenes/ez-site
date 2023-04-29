import {Request, Response} from "express";
import {NextFunction} from "connect";

const subdomain = (subdomainName: string): ((req: Request, res: Response, next: NextFunction) => void) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (req.subdomains[0] === subdomainName) {
			next(); // Proceed to next middleware function
		} else {
			next("route");
		}
	};
};

export default subdomain