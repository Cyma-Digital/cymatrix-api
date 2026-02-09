import addressService from "@/services/address/address.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const {
      userId,
      label,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      isDefault,
      createdBy,
      updatedBy,
    } = req.body

    const idUser = 1

    const address = await addressService.create({
      userId: idUser,
      label,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      isDefault,
      createdBy: idUser,
      updatedBy: idUser,
    })

    return res.status(201).json({
      status: "success",
      data: address,
    })
  } catch (error) {
    next(error)
  }
}
