import {Request, Response} from "express";
import {NextFunction} from "connect";

const checkDomainName = (domainName: string | string[]): ((req: Request, res: Response, next: NextFunction) => void) => {
	switch (typeof domainName) {
		case 'string':
			return (req: Request, res: Response, next: NextFunction): void => {

				if (req.hostname.includes(domainName)) {
					next(); // Proceed to next middleware function
				} else {
					next("route");
				}
			}

		case 'object':
			return (req: Request, res: Response, next: NextFunction): void => {
				if (domainName.includes(req.hostname)) {
					next(); // Proceed to next middleware function
				} else {
					next("route");
				}
			}
	}
};

export default checkDomainName