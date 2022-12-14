import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Select,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ErrorMessage, useFormik } from "formik";
import Image from "next/image";
import medalha1Img from "../public/medalha1.png";
import medalha2Img from "../public/medalha2.png";
import medalha3Img from "../public/medalha3.png";
import medalha4Img from "../public/medalha4.png";

import brasilPng from "../public/Brasil.png";
import { CriarApostaApiGateway } from "./CriarApostaApiGateway";
import { CriarApostaParam, CriarApostaUsecase } from "./CriarApostaUsecase";
import { Time, times } from "./times";

export const criarApostaUsecase = new CriarApostaUsecase(new CriarApostaApiGateway());

const timesOrdenados = [...times].sort((a, b) => a.nome.localeCompare(b.nome));

function getBandeira(time: Time["nome"]) {
  return times.find((t) => t.nome === time)?.bandeira;
}

export function CriarApostaForm() {
  const toast = useToast();
  const formik = useFormik<CriarApostaParam>({
    validateOnChange: false,
    initialValues: {
      nome: "",
      "1": "" as Time["nome"],
      "2": "" as Time["nome"],
      "3": "" as Time["nome"],
      "4": "" as Time["nome"],
    },
    validationSchema: criarApostaUsecase.validationSchema,
    async onSubmit(values, actions) {
      actions.setStatus(undefined);
      try {
        await criarApostaUsecase.execute(values);
        toast({
          title: "Aposta criada com sucesso",
          status: "success",
          duration: 5000,
        });
        actions.resetForm();
      } catch (error) {
        if (error instanceof Error) {
          actions.setStatus(error.message);
          toast({
            status: "error",
            title: "Houve um erro",
            description: error.message,
          });
        }
      }
    },
  });

  return (
    <form id="CriarApostaForm" onSubmit={formik.handleSubmit}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Fa??a seu palpite</Heading>

        <FormControl isInvalid={!!formik.errors.nome}>
          <FormLabel>Nome completo</FormLabel>
          <Input
            type="text"
            placeholder="Digite nome e sobrenome"
            name="nome"
            onChange={formik.handleChange}
            value={formik.values.nome}
          />
          <FormHelperText>Seu nome identificar?? seu palpite</FormHelperText>
          <FormErrorMessage>{formik.errors.nome}</FormErrorMessage>
        </FormControl>
        <VStack spacing={4}>
          {(
            [
              {
                name: "1",
                label: "1??",
                placeholder: "Selecione a campe??",
                defaulFlag: medalha1Img,
              },
              {
                name: "2",
                label: "2??",
                placeholder: "Selecione a vice",
                defaulFlag: medalha2Img,
              },
              {
                name: "3",
                label: "3??",
                placeholder: "Selecione a 3?? colocada",
                defaulFlag: medalha3Img,
              },
              {
                name: "4",
                label: "4??",
                placeholder: "Selecione a 4?? colocada",
                defaulFlag: medalha4Img,
              },
            ] as const
          ).map((inputConfig) => {
            const bandeira = getBandeira(formik.values[inputConfig.name]);
            return (
              <FormControl
                key={inputConfig.name}
                isInvalid={!!formik.errors[inputConfig.name]}
              >
                <InputGroup size="lg">
                  <InputLeftAddon>{inputConfig.label}</InputLeftAddon>
                  <Select
                    placeholder={inputConfig.placeholder}
                    name={inputConfig.name}
                    onChange={formik.handleChange}
                    value={formik.values[inputConfig.name]}
                    zIndex={1}
                  >
                    {timesOrdenados.map((time) => (
                      <option key={time.nome} value={time.nome}>
                        {time.nome}
                      </option>
                    ))}
                  </Select>
                  <InputRightAddon
                    position={"relative"}
                    width={16}
                    overflow={"hidden"}
                  >
                    {bandeira ? (
                      <Image
                        alt="bandeira"
                        style={{ objectFit: "cover" }}
                        src={bandeira}
                        fill
                      />
                    ) : (
                      <Image
                        alt="bandeira"
                        style={{ objectFit: "scale-down" }}
                        src={inputConfig.defaulFlag}
                        fill
                      />
                    )}
                  </InputRightAddon>
                </InputGroup>
                <FormErrorMessage>
                  {formik.errors[inputConfig.name]}
                </FormErrorMessage>
              </FormControl>
            );
          })}
        </VStack>
        <FormControl isInvalid={!!formik.status}>
          <FormErrorMessage>{formik.status}</FormErrorMessage>
        </FormControl>
        <Button type="submit" size="lg" isLoading={formik.isSubmitting}>
          Fazer Palpite
        </Button>
      </VStack>
    </form>
  );
}
