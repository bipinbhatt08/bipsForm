import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormFieldInputModel, createFormFieldOutputModel, createFormInputModel, createFormOutputModel } from "./model";
import { formService,formfieldService } from "../../services";


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
    }),

    createFormField: authenticatedProcedure
    .meta({
    openapi:{
      method:"POST",
      path:getPath("/createFormField"),
      tags:TAGS
    }
    })
    .input(createFormFieldInputModel)
    .output(createFormFieldOutputModel)
    .mutation(async({ctx,input})=>{
        const {id} = await formfieldService.createFormField(ctx.user.id, input)
        return {id}
    })
})