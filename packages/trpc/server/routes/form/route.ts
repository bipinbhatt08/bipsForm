import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "../../services";
import { createFormInputModel, createFormOutputModel } from "./model";


const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({

    createForm: authenticatedProcedure
    .meta({
     openapi:{
      method:"POST",
      path:getPath("/createForm"),
      tags:TAGS
     }
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async({input,ctx})=>{
        const { id, slug } = await formService.createForm(ctx.user.id, input)
        return { id, slug}
    })
})