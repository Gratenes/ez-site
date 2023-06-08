import {Request, Response} from "express";

const checkDomainName = (
  domainName: string | string[]
): ((req: Request, res: Response, next: (arg1?: any) => void) => void) => {
  switch (typeof domainName) {
    case "string":
      return (
        req: Request,
        res: Response,
        next: (arg1?: any) => void
      ): void => {
        if (req.hostname.includes(domainName)) {
          next(); // Proceed to next middleware function
        } else {
          next("route");
        }
      };

    case "object":
      return (
        req: Request,
        res: Response,
        next: (arg1?: any) => void
      ): void => {
        if (domainName.includes(req.hostname)) {
          next(); // Proceed to next middleware function
        } else {
          next("route");
        }
      };
  }
};

export default checkDomainName