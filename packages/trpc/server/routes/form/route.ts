import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormFieldInputModel, createFormFieldOutputModel, createFormInputModel, createFormOutputModel, getMyFormsOutputModel, getFormFieldsInputModel, getFormFieldsOutputModel } from "./model";
import { formService,formfieldService } from "../../services";


const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({

    getMyForms: authenticatedProcedure
    .meta({
     openapi:{
      method:"GET",
      path:getPath("/getMyForms"),
      tags:TAGS
     }
    })
    .output(getMyFormsOutputModel)
    .query(async({ ctx }) => {
        return formService.getMyForms(ctx.user.id)
    }),

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
    }),

    getFormFields: authenticatedProcedure
    .meta({
        openapi:{
            method:"GET",
            path:getPath("/getFormFields"),
            tags:TAGS
        }
    })
    .input(getFormFieldsInputModel)
    .output(getFormFieldsOutputModel)
    .query(async({ input }) => {
        // jsonb columns (options, validations, conditions) are typed as `unknown` by Drizzle;
        // Zod validates the shape at runtime via the output model.
        return formfieldService.getFormFields(input.formId) as any
    })
})